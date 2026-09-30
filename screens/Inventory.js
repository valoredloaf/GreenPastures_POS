import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function InventoryScreen({
  ingredients = [],
  categories = [],
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onBack,
}) {

  const [showManageCategories, setShowManageCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [renamingCategory, setRenamingCategory] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const [addingToCategory, setAddingToCategory] = useState(null);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('ml');
  const [newQuantity, setNewQuantity] = useState('');
  const [newThreshold, setNewThreshold] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  const [editCategory, setEditCategory] = useState('');


  const handleAddCategory = () => {
    const name = newCategoryName.trim();

    if (!name) {
      Alert.alert('Missing name', 'Please enter a category name.');
      return;
    }

    if (categories.includes(name)) {
      Alert.alert('Duplicate category', 'That category already exists.');
      return;
    }

    onAddCategory(name);
    setNewCategoryName('');
  };

  const startRenaming = (category) => {
    setRenamingCategory(category);
    setRenameValue(category);
  };

  const saveRename = () => {
    const name = renameValue.trim();

    if (!name) {
      Alert.alert('Missing name', 'Please enter a category name.');
      return;
    }

    if (name !== renamingCategory && categories.includes(name)) {
      Alert.alert('Duplicate category', 'That category already exists.');
      return;
    }

    onRenameCategory(renamingCategory, name);
    setRenamingCategory(null);
    setRenameValue('');
  };

  const handleDeleteCategory = (category) => {
    const inUse = ingredients.some(ing => ing.category === category);

    if (inUse) {
      Alert.alert(
        'Category in use',
        `Some ingredients are still in "${category}". Move or delete them first.`
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Remove "${category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteCategory(category),
        },
      ]
    );
  };


  const openAddForm = (category) => {
    setAddingToCategory(category);
    setNewName('');
    setNewUnit('ml');
    setNewQuantity('');
    setNewThreshold('');
  };

  const handleAddIngredient = () => {

    if (!newName.trim()) {
      Alert.alert('Missing name', 'Please enter an ingredient name.');
      return;
    }

    const qty = Number(newQuantity);
    const threshold = Number(newThreshold) || 0;

    if (!newQuantity || isNaN(qty) || qty < 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid starting quantity.');
      return;
    }

    onAddIngredient({
      name: newName.trim(),
      unit: newUnit,
      quantity: qty,
      threshold,
      category: addingToCategory,
    });

    setAddingToCategory(null);
  };


  const startEditing = (ingredient) => {
    setEditingId(ingredient.id);
    setEditName(ingredient.name);
    setEditUnit(ingredient.unit);
    setEditQuantity(String(ingredient.quantity));
    setEditThreshold(String(ingredient.threshold));
    setEditCategory(ingredient.category);
  };

  const saveEdit = (id) => {

    if (!editName.trim()) {
      Alert.alert('Missing name', 'Please enter an ingredient name.');
      return;
    }

    const qty = Number(editQuantity);
    const threshold = Number(editThreshold) || 0;

    if (editQuantity === '' || isNaN(qty) || qty < 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity.');
      return;
    }

    onUpdateIngredient(id, {
      name: editName.trim(),
      unit: editUnit,
      quantity: qty,
      threshold,
      category: editCategory,
    });

    setEditingId(null);
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Ingredient',
      `Remove "${name}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteIngredient(id),
        },
      ]
    );
  };



  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.categoriesButton}
            onPress={() => setShowManageCategories(!showManageCategories)}
          >
            <Text style={styles.categoriesButtonText}>
              {showManageCategories ? 'Close' : 'Categories'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>


      {/* MANAGE CATEGORIES PANEL */}

      {showManageCategories && (
        <View style={styles.categoryPanel}>

          <Text style={styles.panelTitle}>Manage Categories</Text>

          {categories.map(category => (
            <View key={category} style={styles.categoryRow}>

              {renamingCategory === category ? (
                <>
                  <TextInput
                    style={styles.categoryRenameInput}
                    value={renameValue}
                    onChangeText={setRenameValue}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.smallActionButton} onPress={saveRename}>
                    <Text style={styles.smallActionText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallActionButton, styles.cancelActionButton]}
                    onPress={() => setRenamingCategory(null)}
                  >
                    <Text style={styles.smallActionText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.categoryRowName}>{category}</Text>
                  <TouchableOpacity
                    style={styles.smallActionButton}
                    onPress={() => startRenaming(category)}
                  >
                    <Text style={styles.smallActionText}>Rename</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallActionButton, styles.deleteActionButton]}
                    onPress={() => handleDeleteCategory(category)}
                  >
                    <Text style={styles.smallActionText}>Delete</Text>
                  </TouchableOpacity>
                </>
              )}

            </View>
          ))}

          <View style={styles.addCategoryRow}>
            <TextInput
              style={styles.addCategoryInput}
              placeholder="New category name"
              placeholderTextColor="#9AA0A6"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity style={styles.addCategoryButton} onPress={handleAddCategory}>
              <Text style={styles.addCategoryButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

        </View>
      )}


      {/* INGREDIENT LIST, GROUPED BY CATEGORY */}

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>

        {categories.map(category => {

          const categoryIngredients = ingredients.filter(
            ing => ing.category === category
          );

          return (
            <View key={category} style={styles.categorySection}>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{category}</Text>
                <TouchableOpacity
                  style={styles.sectionAddButton}
                  onPress={() => openAddForm(category)}
                >
                  <Text style={styles.sectionAddText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {addingToCategory === category && (
                <View style={styles.addForm}>

                  <TextInput
                    style={styles.input}
                    placeholder="Ingredient name"
                    placeholderTextColor="#9AA0A6"
                    value={newName}
                    onChangeText={setNewName}
                  />

                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.rowInput]}
                      placeholder="Unit (ml / g)"
                      placeholderTextColor="#9AA0A6"
                      value={newUnit}
                      onChangeText={setNewUnit}
                    />
                    <TextInput
                      style={[styles.input, styles.rowInput]}
                      placeholder="Starting qty"
                      placeholderTextColor="#9AA0A6"
                      keyboardType="numeric"
                      value={newQuantity}
                      onChangeText={setNewQuantity}
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Low-stock threshold (optional)"
                    placeholderTextColor="#9AA0A6"
                    keyboardType="numeric"
                    value={newThreshold}
                    onChangeText={setNewThreshold}
                  />

                  <View style={styles.formButtonRow}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleAddIngredient}>
                      <Text style={styles.saveButtonText}>Save Ingredient</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, styles.cancelFormButton]}
                      onPress={() => setAddingToCategory(null)}
                    >
                      <Text style={styles.saveButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              )}

              {categoryIngredients.length === 0 ? (
                <Text style={styles.emptyText}>No ingredients yet.</Text>
              ) : (
                categoryIngredients.map(item => {

                  const isLow = item.quantity <= item.threshold;

                  return (
                    <View
                      key={item.id}
                      style={[styles.card, isLow && styles.cardLow]}
                    >

                      {editingId === item.id ? (

                        <View style={styles.editForm}>

                          <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={editName}
                            onChangeText={setEditName}
                          />

                          <View style={styles.row}>
                            <TextInput
                              style={[styles.input, styles.rowInput]}
                              placeholder="Unit"
                              value={editUnit}
                              onChangeText={setEditUnit}
                            />
                            <TextInput
                              style={[styles.input, styles.rowInput]}
                              placeholder="Quantity"
                              keyboardType="numeric"
                              value={editQuantity}
                              onChangeText={setEditQuantity}
                            />
                          </View>

                          <TextInput
                            style={styles.input}
                            placeholder="Low-stock threshold"
                            keyboardType="numeric"
                            value={editThreshold}
                            onChangeText={setEditThreshold}
                          />

                          <Text style={styles.label}>Category</Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoryPicker}
                          >
                            {categories.map(cat => (
                              <TouchableOpacity
                                key={cat}
                                style={[
                                  styles.categoryChip,
                                  editCategory === cat && styles.categoryChipSelected,
                                ]}
                                onPress={() => setEditCategory(cat)}
                              >
                                <Text style={styles.categoryChipText}>{cat}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>

                          <View style={styles.formButtonRow}>
                            <TouchableOpacity
                              style={styles.saveButton}
                              onPress={() => saveEdit(item.id)}
                            >
                              <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.saveButton, styles.cancelFormButton]}
                              onPress={() => setEditingId(null)}
                            >
                              <Text style={styles.saveButtonText}>Cancel</Text>
                            </TouchableOpacity>
                          </View>

                        </View>

                      ) : (

                        <>
                          <View style={styles.cardTop}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            {isLow && <Text style={styles.lowBadge}>LOW STOCK</Text>}
                          </View>

                          <View style={styles.cardBottom}>
                            <Text style={styles.quantityText}>
                              {item.quantity} {item.unit} on hand
                            </Text>

                            <View style={styles.actionRow}>
                              <TouchableOpacity
                                style={styles.smallActionButton}
                                onPress={() => startEditing(item)}
                              >
                                <Text style={styles.smallActionText}>Edit</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.smallActionButton, styles.deleteActionButton]}
                                onPress={() => handleDelete(item.id, item.name)}
                              >
                                <Text style={styles.smallActionText}>Delete</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </>

                      )}

                    </View>
                  );

                })
              )}

            </View>
          );

        })}

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#555555', padding: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  categoriesButton: {
    backgroundColor: '#5d4738',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  categoriesButtonText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  backButton: {
    backgroundColor: '#BBBBBB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  backText: { fontSize: 12, fontWeight: '600' },

  categoryPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  panelTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  categoryRowName: { flex: 1, fontSize: 12, fontWeight: '600' },
  categoryRenameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  addCategoryRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  addCategoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    backgroundColor: '#FAFAFA',
  },
  addCategoryButton: {
    backgroundColor: '#5d4738',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addCategoryButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  list: { flex: 1 },
  categorySection: { marginBottom: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
  sectionAddButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  sectionAddText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  emptyText: { fontSize: 11, color: '#DDD', fontStyle: 'italic', marginBottom: 6 },

  addForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8 },
  rowInput: { flex: 1 },
  formButtonRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelFormButton: { backgroundColor: '#9CA3AF' },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  cardLow: { borderWidth: 1.5, borderColor: '#DC2626' },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: { fontSize: 12, fontWeight: 'bold', flex: 1 },
  lowBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityText: { fontSize: 11, color: '#374151' },
  actionRow: { flexDirection: 'row', gap: 6 },
  smallActionButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  cancelActionButton: { backgroundColor: '#D1D5DB' },
  deleteActionButton: { backgroundColor: '#FEE2E2' },
  smallActionText: { fontSize: 10, fontWeight: '600' },

  editForm: { paddingVertical: 4 },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 6, color: '#374151' },
  categoryPicker: { marginBottom: 10 },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  categoryChipSelected: {
    borderWidth: 2,
    borderColor: '#5d4738',
    backgroundColor: '#F3E8E3',
  },
  categoryChipText: { fontSize: 11, fontWeight: '600' },
});