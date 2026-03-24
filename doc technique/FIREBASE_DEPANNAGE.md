# 🔥 Firebase Emulator — Dépannage Rapide

**Créé le :** 23 Mars 2026  
**Projet :** L'Atelier POS  
**Statut :** ✅ Migration Firebase complétée

---

## 📋 Problèmes Rencontrés et Solutions

### ❌ Problème 1 : "Base de données vide dans Firestore UI"

**Symptôme :**
- Tu vas sur http://localhost:4000/firestore
- Tu ne vois aucune collection
- Message : "Start collection"

**Cause :**
- Le projet Firebase dans `.firebaserc` ne correspond pas au projet utilisé par les émulateurs
- Exemple : `.firebaserc` dit `atelier-pos-dev` mais les émulateurs tournent sur `reservation-kite`

**Solution :**
```bash
# 1. Arrêter les émulateurs
ps aux | grep firebase | grep -v grep | awk '{print $2}' | xargs kill

# 2. Relancer avec le bon projet
cd /Users/mathieu/StudioProjects/stitch_kds_cran_cuisine
firebase emulators:start --project atelier-pos-dev

# 3. Seeder les données
# Dans la console du navigateur (F12) sur http://localhost:5173 :
await import('/src/firebase/seed.ts').then(m => m.seedDatabase())

# OU utilise le bouton "🔥 Tester Firebase" en bas à droite
```

**Vérification :**
```bash
# Vérifie que .firebaserc contient le bon projet
cat .firebaserc
# Doit afficher : "default": "atelier-pos-dev"
```

---

### ❌ Problème 2 : "Firebase App named 'firestore component::0.xxx' already deleted"

**Symptôme :**
- Erreurs dans la console du navigateur
- Messages : `Firebase App named 'firestore component::0.123' already deleted`
- L'app plante ou ne se connecte pas

**Cause :**
- Plusieurs instances Firebase sont créées
- Les émulateurs sont connectés plusieurs fois
- Le fichier `src/firebase/config.ts` n'utilise pas de singleton

**Solution :**
```typescript
// Fichier : src/firebase/config.ts
// DOIT utiliser des variables globales et une seule initialisation

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let emulatorsConnected = false;

export function getApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return appInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getApp());
    if (import.meta.env.DEV && !emulatorsConnected) {
      connectFirestoreEmulator(dbInstance, 'localhost', 8080);
      emulatorsConnected = true;
    }
  }
  return dbInstance;
}
```

**Vérification :**
- Rafraîchir la page (Cmd+R)
- Console doit afficher :
  ```
  [Firebase] ✅ Application initialisée
  [Firebase] ✅ Firestore connecté aux émulateurs
  ```

---

### ❌ Problème 3 : "require is not defined"

**Symptôme :**
- Erreur dans la console : `Uncaught ReferenceError: require is not defined`
- L'app ne démarre pas

**Cause :**
- Utilisation de `require()` (CommonJS) au lieu de `import` (ES6)
- Le projet utilise ES6 modules (Vite)

**Solution :**
```typescript
// ❌ MAUVAIS (CommonJS)
const { getFirestore } = require('firebase/firestore');

// ✅ BON (ES6)
import { getFirestore } from 'firebase/firestore';
```

**Fichier à vérifier :** `src/firebase/config.ts`

---

### ❌ Problème 4 : "Java is not installed" ou "Please install a JDK"

**Symptôme :**
- Erreur au lancement des émulateurs :
  ```
  Please make sure Java is installed and on your system PATH
  ```

**Cause :**
- Firebase Emulator nécessite Java 21+
- Java n'est pas installé ou pas dans le PATH

**Solution :**
```bash
# Installer Java 21
brew install openjdk@21

# Lier Java 21
brew link openjdk@21 --force

# Vérifier
java -version
# Doit afficher : openjdk version "21.x.x"
```

**Si le lien échoue :**
```bash
# Forcer le symlink (nécessite sudo)
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk \
  /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

---

### ❌ Problème 5 : "Firebase Tools no longer supports Java version before 21"

**Symptôme :**
```
Error: firebase-tools no longer supports Java version before 21.
Please install a JDK at version 21 or above
```

**Cause :**
- Java 11 ou 17 est installé, mais Firebase nécessite Java 21

**Solution :**
```bash
# Installer Java 21
brew install openjdk@21

# Bascule sur Java 21
brew link openjdk@21 --force

# Vérifier
java -version
# Doit afficher : openjdk version "21.x.x"
```

---

### ❌ Problème 6 : "Cannot read property 'add' of undefined" ou "db is undefined"

**Symptôme :**
- Erreur : `Cannot read property 'add' of undefined`
- Ou : `db is undefined`

**Cause :**
- Le fichier `src/firebase/config.ts` n'exporte pas correctement `db`
- Ou l'initialisation échoue silencieusement

**Solution :**
```typescript
// Vérifier que src/firebase/config.ts exporte bien :
export const db = getDb();
export const auth = getAuthInstance();
export const app = getApp();
```

**Vérification :**
```javascript
// Dans la console du navigateur :
import { db } from '/src/firebase/config.ts';
console.log('db:', db);
// Doit afficher un objet Firestore, pas undefined
```

---

### ❌ Problème 7 : "Rules de sécurité bloquent l'accès"

**Symptôme :**
```
FirebaseError: false for 'list' @ L49, false for 'list' @ L185
```

**Cause :**
- Les rules Firestore sont trop restrictives
- En mode développement, il faut des rules permissives

**Solution :**
```javascript
// Fichier : firestore.rules
// En DÉVELOPPEMENT, utiliser :
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Pour la production :**
- Décommenter les rules complètes (dans `firestore.rules`)
- Commenter la règle permissive

**Après modification :**
```bash
# Redémarrer les émulateurs
ps aux | grep firebase | grep -v grep | awk '{print $2}' | xargs kill
firebase emulators:start --project atelier-pos-dev
```

---

## 🛠️ Commandes Utiles

### Lancer les émulateurs
```bash
cd /Users/mathieu/StudioProjects/stitch_kds_cran_cuisine
firebase emulators:start --project atelier-pos-dev
```

### Arrêter les émulateurs
```bash
ps aux | grep firebase | grep -v grep | awk '{print $2}' | xargs kill
```

### Vérifier que les émulateurs tournent
```bash
curl -s http://localhost:8080 -o /dev/null -w "Firestore: %{http_code}\n"
curl -s http://localhost:9099 -o /dev/null -w "Auth: %{http_code}\n"
curl -s http://localhost:4000 -o /dev/null -w "UI: %{http_code}\n"
```

### Seeder la base de données
```bash
# Via le bouton de test (recommandé)
# 1. Ouvrir http://localhost:5173
# 2. Cliquer sur "🔥 Tester Firebase" (en bas à droite)
# 3. Cliquer sur "Lancer tous les tests"

# OU via la console du navigateur
await import('/src/firebase/seed.ts').then(m => m.seedDatabase())
```

### Vérifier les données
```bash
# Via Node.js
node scripts/verify-firestore.js

# OU via la console du navigateur
const { getFirestore, collection, getDocs } = await import('firebase/firestore');
const { db } = await import('/src/firebase/config.ts');

const users = await getDocs(collection(db, 'users'));
console.log('Users:', users.size, 'documents');
```

---

## 📊 Configuration Attendue

### Fichier `.firebaserc`
```json
{
  "projects": {
    "default": "atelier-pos-dev"
  }
}
```

### Fichier `firebase.json`
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "port": 4000 }
  }
}
```

### Fichier `src/firebase/config.ts`
- ✅ Utilise des variables globales (`appInstance`, `dbInstance`, etc.)
- ✅ Initialise une seule fois
- ✅ Connecte les émulateurs une seule fois
- ✅ Exporte `app`, `db`, `auth`

### Fichier `firestore.rules` (Développement)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 🎯 Checklist de Vérification

### Avant de lancer l'app
- [ ] Java 21 installé (`java -version`)
- [ ] `.firebaserc` contient `atelier-pos-dev`
- [ ] `firebase.json` configuré correctement
- [ ] Émulateurs lancés (`firebase emulators:start`)

### Après le lancement
- [ ] http://localhost:8080 répond (200)
- [ ] http://localhost:9099 répond (200)
- [ ] http://localhost:4000 répond (200)
- [ ] Console affiche `[Firebase] ✅ Application initialisée`
- [ ] Console affiche `[Firebase] ✅ Firestore connecté aux émulateurs`

### Après le seed
- [ ] 4 utilisateurs créés
- [ ] 8 tables créées
- [ ] 12 items de menu créés
- [ ] 5 commandes créées
- [ ] 3 réservations créées
- [ ] Collections visibles dans http://localhost:4000/firestore

---

## 🔗 Liens Utiles

- **Interface Firebase :** http://localhost:4000
- **Firestore Emulator :** http://localhost:4000/firestore
- **Auth Emulator :** http://localhost:4000/auth
- **App de dev :** http://localhost:5173

---

## 📞 En Cas de Problème

1. **Vérifie les logs** : `ps aux | grep firebase`
2. **Redémarre les émulateurs** : Kill + relance
3. **Vérifie Java** : `java -version` (doit être 21+)
4. **Vérifie .firebaserc** : Doit contenir `atelier-pos-dev`
5. **Utilise le bouton de test** : "🔥 Tester Firebase"

---

**Dernière mise à jour :** 23 Mars 2026  
**Version :** 1.0
