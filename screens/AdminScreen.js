import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

import InventoryScreen from './Inventory';
import AddProductsScreen from './AddProducts';
import ReportsScreen from './Reports';
import { showAlert, confirmDialog } from '../services/dialog';
import { fetchAllProfiles, verifyProfile, deleteProfile } from '../services/authApi';
import {
  saveIngredient,
  updateIngredientDoc,
  deleteIngredientDoc,
  saveIngredientCategory,
  deleteIngredientCategoryDoc,
  renameIngredientCategoryDocs,
  saveProduct,
  deleteProductDoc,
  saveMenuCategory,
  deleteMenuCategoryDoc,
} from '../services/dataApi';

export default function AdminScreen({
  adminName,
  products,
  setProducts,
  ingredients,
  setIngredients,
  ingredientCategories,
  setIngredientCategories,
  menuCategories,
  setMenuCategories,
  salesHistory,
  onLogout,
}) {

  const [activeSection, setActiveSection] = useState('home'); // 'home' | 'accounts' | 'inventory' | 'products' | 'reports'

  const [accounts, setAccounts] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Shown if a change could not be saved to the database
  const fail = (e) => showAlert('Not saved', e?.message || 'Could not save to the database.');

  // Firestore document IDs cannot contain "/"
  const hasBadChars = (name) => name.includes('/');

  const loadAccounts = async () => {
    try {
      const data = await fetchAllProfiles();
      setAccounts(data);
    } catch (e) {
      fail(e);
    }
  };

  useEffect(() => {
    if (activeSection === 'accounts') {
      loadAccounts();
    }
  }, [activeSection]);

  const handleApprove = async (id, name) => {
    try {
      await verifyProfile(id);
      showAlert('Approved', `${name} can now log in.`);
      loadAccounts();
    } catch (e) {
      fail(e);
    }
  };

  const handleDeleteAccount = (id, name) => {
    confirmDialog('Delete Account', `Remove "${name}"? This cannot be undone.`, 'Delete', async () => {
      try {
        await deleteProfile(id);
        loadAccounts();
      } catch (e) {
        fail(e);
      }
    });
  };

  const handleAddMenuCategory = () => {
    const name = newCategoryName.trim();

    if (!name) {
      showAlert('Missing name', 'Please enter a category name.');
      return;
    }

    if (hasBadChars(name)) {
      showAlert('Invalid name', 'Category names cannot contain "/".');
      return;
    }

    if (menuCategories[name]) {
      showAlert('Duplicate', 'That menu category already exists.');
      return;
    }

    const colors = ['#B99F96', '#A9A34F', '#FFC080', '#F28B96', '#69C276', '#63B9AE', '#8FBFE0', '#C79FEF'];
    const nextColor = colors[Object.keys(menuCategories).length % colors.length];

    setMenuCategories(prev => ({ ...prev, [name]: nextColor }));
    saveMenuCategory(name, nextColor).catch(fail);
    setNewCategoryName('');
    showAlert('Added', `"${name}" is now available on the Cashier screen.`);
  };

  const handleDeleteMenuCategory = (name) => {
    const inUse = products.some(p => p.category === name);

    if (inUse) {
      showAlert('Category in use', `Some products are still in "${name}". Move or remove them first.`);
      return;
    }

    confirmDialog('Delete Menu Category', `Remove "${name}" from the menu?`, 'Delete', () => {
      setMenuCategories(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
      deleteMenuCategoryDoc(name).catch(fail);
    });
  };

  // ===================================================
  // SECTION: INVENTORY
  // ===================================================
  if (activeSection === 'inventory') {
    return (
      <InventoryScreen
        ingredients={ingredients}
        categories={ingredientCategories}
        onAddIngredient={(newIngredient) => {
          const ing = {
            ...newIngredient,
            id: Math.max(0, ...ingredients.map(i => i.id)) + 1,
          };
          setIngredients(prev => [...prev, ing]);
          saveIngredient(ing).catch(fail);
        }}
        onUpdateIngredient={(id, updatedFields) => {
          setIngredients(prev =>
            prev.map(item => (item.id === id ? { ...item, ...updatedFields } : item))
          );
          updateIngredientDoc(id, updatedFields).catch(fail);
        }}
        onDeleteIngredient={(id) => {
          setIngredients(prev => prev.filter(item => item.id !== id));
          deleteIngredientDoc(id).catch(fail);
        }}
        onAddCategory={(name) => {
          if (hasBadChars(name)) {
            showAlert('Invalid name', 'Category names cannot contain "/".');
            return;
          }
          setIngredientCategories(prev => [...prev, name]);
          saveIngredientCategory(name).catch(fail);
        }}
        onRenameCategory={(oldName, newName) => {
          if (hasBadChars(newName)) {
            showAlert('Invalid name', 'Category names cannot contain "/".');
            return;
          }
          const affectedIds = ingredients
            .filter(ing => ing.category === oldName)
            .map(ing => ing.id);

          setIngredientCategories(prev => prev.map(cat => (cat === oldName ? newName : cat)));
          setIngredients(prev =>
            prev.map(ing => (ing.category === oldName ? { ...ing, category: newName } : ing))
          );
          renameIngredientCategoryDocs(oldName, newName, affectedIds).catch(fail);
        }}
        onDeleteCategory={(name) => {
          setIngredientCategories(prev => prev.filter(cat => cat !== name));
          deleteIngredientCategoryDoc(name).catch(fail);
        }}
        onBack={() => setActiveSection('home')}
      />
    );
  }

  // ===================================================
  // SECTION: PRODUCTS
  // The live listener in App.js updates the list once Firestore accepts the change
  // ===================================================
  if (activeSection === 'products') {
    return (
      <AddProductsScreen
        categories={Object.keys(menuCategories)}
        categoryColors={menuCategories}
        ingredients={ingredients}
        ingredientCategories={ingredientCategories}
        products={products}
        onAddProduct={(newProduct) =>
          saveProduct({
            ...newProduct,
            id: Math.max(0, ...products.map(p => p.id)) + 1,
          })
        }
        onDeleteProduct={(id) => deleteProductDoc(id)}
        onBack={() => setActiveSection('home')}
      />
    );
  }

  // ===================================================
  // SECTION: REPORTS
  // ===================================================
  if (activeSection === 'reports') {
    return (
      <ReportsScreen
        salesHistory={salesHistory}
        onBack={() => setActiveSection('home')}
      />
    );
  }

  // ===================================================
  // SECTION: ACCOUNTS
  // ===================================================
  if (activeSection === 'accounts') {

    const pending = accounts.filter(a => !a.verified);
    const approved = accounts.filter(a => a.verified);

    return (
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>Manage Accounts</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => setActiveSection('home')}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>

          <Text style={styles.sectionLabel}>Pending Approval</Text>
          {pending.length === 0 ? (
            <Text style={styles.emptyText}>No pending accounts.</Text>
          ) : (
            pending.map(acc => (
              <View key={acc.id} style={styles.accountCard}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{acc.name}</Text>
                  <Text style={styles.accountRole}>{acc.role}</Text>
                </View>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApprove(acc.id, acc.name)}
                >
                  <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAccount(acc.id, acc.name)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <Text style={styles.sectionLabel}>Approved Accounts</Text>
          {approved.map(acc => (
            <View key={acc.id} style={styles.accountCard}>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{acc.name}</Text>
                <Text style={styles.accountRole}>{acc.role}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteAccount(acc.id, acc.name)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}

        </ScrollView>

      </View>
    );
  }

  // ===================================================
  // HOME DASHBOARD
  // ===================================================
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Admin — {adminName}</Text>
        <TouchableOpacity style={styles.backButton} onPress={onLogout}>
          <Text style={styles.backText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>

        <View style={styles.tileRow}>
          <TouchableOpacity style={styles.tile} onPress={() => setActiveSection('accounts')}>
            <Text style={styles.tileIcon}>👤</Text>
            <Text style={styles.tileLabel}>Manage Accounts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => setActiveSection('inventory')}>
            <Text style={styles.tileIcon}>▣</Text>
            <Text style={styles.tileLabel}>Inventory</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tileRow}>
          <TouchableOpacity style={styles.tile} onPress={() => setActiveSection('products')}>
            <Text style={styles.tileIcon}>🛒</Text>
            <Text style={styles.tileLabel}>Products</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => setActiveSection('reports')}>
            <Text style={styles.tileIcon}>▤</Text>
            <Text style={styles.tileLabel}>Reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryPanel}>

          <Text style={styles.sectionLabel}>Menu Categories</Text>

          {Object.keys(menuCategories).map(cat => (
            <View key={cat} style={styles.categoryRow}>
              <View style={[styles.colorDot, { backgroundColor: menuCategories[cat] }]} />
              <Text style={styles.categoryRowName}>{cat}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMenuCategory(cat)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addCategoryRow}>
            <TextInput
              style={styles.addCategoryInput}
              placeholder="New menu category name"
              placeholderTextColor="#9AA0A6"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity style={styles.approveButton} onPress={handleAddMenuCategory}>
              <Text style={styles.approveText}>Add</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3f3f3f', padding: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backButton: {
    backgroundColor: '#BBBBBB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  backText: { fontSize: 13, fontWeight: '600' },

  tileRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
  },
  tileIcon: { fontSize: 28, marginBottom: 6 },
  tileLabel: { fontSize: 13, fontWeight: '700' },

  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginTop: 14, marginBottom: 8 },
  emptyText: { fontSize: 12, color: '#DDD', fontStyle: 'italic', marginBottom: 8 },

  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 13, fontWeight: '700' },
  accountRole: { fontSize: 11, color: '#6B7280', marginTop: 2, textTransform: 'capitalize' },
  approveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  approveText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },

  categoryPanel: { backgroundColor: '#4a4a4a', borderRadius: 10, padding: 12, marginTop: 6 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  categoryRowName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#fff' },
  addCategoryRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  addCategoryInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 12,
  },
});