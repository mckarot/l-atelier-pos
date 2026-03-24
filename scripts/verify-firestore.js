/**
 * Script de vérification des données Firestore
 * 
 * À exécuter dans la console du navigateur (F12)
 * 
 * Usage :
 * 1. Ouvrir http://localhost:5173
 * 2. Ouvrir la console (F12)
 * 3. Copier-coller ce script
 * 4. Appuyer sur Entrée
 */

(async function verifyFirestoreData() {
  console.log('🔍 Vérification des données Firestore...\n');

  try {
    // Import dynamique des modules Firebase
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../src/firebase/config.ts');

    // Collections à vérifier
    const collections = [
      { name: 'users', label: '👤 Users' },
      { name: 'tables', label: '🪑 Tables' },
      { name: 'menuItems', label: '🍽️ Menu Items' },
      { name: 'orders', label: '📦 Orders' },
      { name: 'reservations', label: '📅 Reservations' },
    ];

    console.log('┌─────────────────────────────────────────┐');
    console.log('│  📊 État de la base de données         │');
    console.log('└─────────────────────────────────────────┘\n');

    let totalDocs = 0;

    for (const { name, label } of collections) {
      try {
        const snap = await getDocs(collection(db, name));
        const count = snap.size;
        totalDocs += count;

        console.log(`${label}: ${count} documents`);

        // Afficher quelques détails pour chaque collection
        if (count > 0) {
          snap.docs.slice(0, 2).forEach((doc) => {
            const data = doc.data();
            if (name === 'users') {
              console.log(`  - ${data.email} (${data.role})`);
            } else if (name === 'tables') {
              console.log(`  - ${data.name} (${data.status})`);
            } else if (name === 'menuItems') {
              console.log(`  - ${data.name} (${data.category})`);
            } else if (name === 'orders') {
              console.log(`  - Table ${data.tableId} (${data.status}) - €${data.total}`);
            } else if (name === 'reservations') {
              console.log(`  - ${data.customerName} (${data.date} ${data.time})`);
            }
          });

          if (count > 2) {
            console.log(`  ... et ${count - 2} autres`);
          }
        }
        console.log('');
      } catch (error) {
        console.error(`${label}: ❌ Erreur - ${error.message}`);
      }
    }

    console.log('┌─────────────────────────────────────────┐');
    console.log(`│  Total: ${totalDocs} documents dans la base       │`);
    console.log('└─────────────────────────────────────────┘\n');

    // Vérifier si la base est vide
    if (totalDocs === 0) {
      console.log('⚠️  La base de données est vide !\n');
      console.log('💡 Solution:');
      console.log('   1. Clique sur le bouton "🔥 Tester Firebase"');
      console.log('   2. Clique sur "Lancer tous les tests"');
      console.log('   3. Rafraîchis cette page\n');
    } else {
      console.log('✅ La base de données est correctement peuplée !\n');
      console.log('📬 Pour voir les données dans l\'UI Firebase:');
      console.log('   1. Ouvre http://localhost:4000/firestore');
      console.log('   2. Rafraîchis la page (Cmd+R)');
      console.log('   3. Les collections devraient apparaître\n');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    console.error('\n💡 Assure-toi que:');
    console.error('   - Les émulateurs Firebase tournent');
    console.error('   - L\'app est lancée (npm run dev)');
    console.error('   - Tu es sur http://localhost:5173\n');
  }
})();
