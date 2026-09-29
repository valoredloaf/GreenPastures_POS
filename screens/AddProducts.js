import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function AddProductsScreen({
  categories = [],
  categoryColors = {},
  ingredients = [],
  ingredientCategories = [],
  products = [],
  onAddProduct,
  onDeleteProduct,
  onBack,
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0] || '');

  // recipe line = { ingredientCategory: string, ingredient: string, amount: string }
  const [recipe, setRecipe] = useState([]);
  const [showManageProducts, setShowManageProducts] = useState(false);

  const addRecipeLine = () => {
    setRecipe(prev => [...prev, { ingredientCategory: '', ingredient: '', amount: '' }]);
  };

  const updateRecipeLine = (index, field, value) => {
    setRecipe(prev =>
      prev.map((line, i) => {
        if (i !== index) return line;

        if (field === 'ingredientCategory') {
          // reset ingredient choice when category changes
          return { ...line, ingredientCategory: value, ingredient: '' };
        }

        return { ...line, [field]: value };
      })
    );
  };

  const removeRecipeLine = (index) => {
    setRecipe(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a product name.');
      return;
    }

    const numericPrice = Number(price);
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid price.');
      return;
    }

    if (!category) {
      Alert.alert('Missing category', 'Please select a category.');
      return;
    }

    const cleanedRecipe = [];

    for (const line of recipe) {
      const isBlank = !line.ingredientCategory && !line.ingredient && !line.amount;
      if (isBlank) continue;

      if (!line.ingredient) {
        Alert.alert('Incomplete ingredient', 'Please select an ingredient for each recipe line, or remove the empty row.');
        return;
      }

      const amountNum = Number(line.amount);
      if (!line.amount || isNaN(amountNum) || amountNum <= 0) {
        Alert.alert('Invalid amount', `Please enter a valid amount for ${line.ingredient}.`);
        return;
      }

      cleanedRecipe.push({ ingredient: line.ingredient, amount: amountNum });
    }

    onAddProduct({
      name: name.trim(),
      price: numericPrice,
      category,
      recipe: cleanedRecipe,
    });

    Alert.alert('Product added', `${name.trim()} has been added.`);

    setName('');
    setPrice('');
    setRecipe([]);
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Remove Product',
      `Remove "${product.name.replace('\n', ' ')}" from the menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onDeleteProduct(product.id),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>

          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {showManageProducts ? 'Manage Products' : 'Add Product'}
            </Text>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowManageProducts(!showManageProducts)}
            >
              <Text style={styles.toggleButtonText}>
                {showManageProducts ? 'Add new' : 'Remove products'}
              </Text>
            </TouchableOpacity>
          </View>

          {showManageProducts ? (

            <View>
              {products.length === 0 ? (
                <Text style={styles.emptyText}>No products yet.</Text>
              ) : (
                products.map(product => (
                  <View key={product.id} style={styles.productRow}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {product.name.replace('\n', ' ')}
                      </Text>
                      <Text style={styles.productMeta}>
                        {product.category} · ₱{product.price}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleDelete(product)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

          ) : (

            <View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Product name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Vanilla Latte"
                  placeholderTextColor="#9AA0A6"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 80"
                  placeholderTextColor="#9AA0A6"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Menu category</Text>
                <View style={styles.categoryRow}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: categoryColors[cat] || '#D0D0D0' },
                        category === cat && styles.categoryChipSelected,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={styles.categoryChipText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* ===================================
                  RECIPE / INGREDIENTS
              =================================== */}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Ingredients used</Text>

                {recipe.map((line, index) => {

                  const ingredientsInCategory = ingredients.filter(
                    ing => ing.category === line.ingredientCategory
                  );

                  return (
                    <View key={index} style={styles.recipeLine}>

                      <Text style={styles.stepLabel}>1. Pick ingredient category</Text>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.picker}
                      >
                        {ingredientCategories.map(cat => (
                          <TouchableOpacity
                            key={cat}
                            style={[
                              styles.ingredientChip,
                              line.ingredientCategory === cat && styles.ingredientChipSelected,
                            ]}
                            onPress={() => updateRecipeLine(index, 'ingredientCategory', cat)}
                          >
                            <Text style={styles.ingredientChipText}>{cat}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      {line.ingredientCategory ? (
                        <>
                          <Text style={styles.stepLabel}>2. Pick ingredient</Text>

                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.picker}
                          >
                            {ingredientsInCategory.length === 0 ? (
                              <Text style={styles.noIngredientsText}>
                                No ingredients in this category yet.
                              </Text>
                            ) : (
                              ingredientsInCategory.map(ing => (
                                <TouchableOpacity
                                  key={ing.id}
                                  style={[
                                    styles.ingredientChip,
                                    line.ingredient === ing.name && styles.ingredientChipSelected,
                                  ]}
                                  onPress={() => updateRecipeLine(index, 'ingredient', ing.name)}
                                >
                                  <Text style={styles.ingredientChipText}>{ing.name}</Text>
                                </TouchableOpacity>
                              ))
                            )}
                          </ScrollView>
                        </>
                      ) : null}

                      <View style={styles.recipeLineBottom}>
                        <TextInput
                          style={styles.amountInput}
                          placeholder="Amount"
                          placeholderTextColor="#9AA0A6"
                          keyboardType="numeric"
                          value={line.amount}
                          onChangeText={(val) => updateRecipeLine(index, 'amount', val)}
                        />

                        <Text style={styles.selectedIngredientText}>
                          {line.ingredient
                            ? `${line.ingredient} (${
                                ingredients.find(i => i.name === line.ingredient)?.unit || ''
                              })`
                            : 'No ingredient selected'}
                        </Text>

                        <TouchableOpacity
                          style={styles.removeLineButton}
                          onPress={() => removeRecipeLine(index)}
                        >
                          <Text style={styles.removeLineText}>✕</Text>
                        </TouchableOpacity>
                      </View>

                    </View>
                  );

                })}

                <TouchableOpacity style={styles.addLineButton} onPress={addRecipeLine}>
                  <Text style={styles.addLineText}>+ Add ingredient</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Add Product</Text>
              </TouchableOpacity>

            </View>

          )}

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back to Order</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F6F8' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '700' },
  toggleButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  toggleButtonText: { fontSize: 11, fontWeight: '600' },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#374151' },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999999',
  },
  categoryChipSelected: { borderWidth: 2, borderColor: '#111827' },
  categoryChipText: { fontSize: 12, fontWeight: '600' },

  recipeLine: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  picker: { marginBottom: 8 },
  noIngredientsText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  ingredientChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  ingredientChipSelected: {
    borderWidth: 2,
    borderColor: '#5d4738',
    backgroundColor: '#F3E8E3',
  },
  ingredientChipText: { fontSize: 11, fontWeight: '600' },
  recipeLineBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  amountInput: {
    width: 70,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    backgroundColor: '#fff',
  },
  selectedIngredientText: { flex: 1, fontSize: 11, color: '#6B7280' },
  removeLineButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeLineText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  addLineButton: { alignSelf: 'flex-start', marginTop: 4 },
  addLineText: { fontSize: 12, fontWeight: '600', color: '#5d4738' },

  submitButton: {
    backgroundColor: '#5d4738',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  backButton: { marginTop: 16, alignSelf: 'center' },
  backText: { fontSize: 13, color: '#6B7280' },

  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 20 },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '600' },
  productMeta: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  removeButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  removeButtonText: { fontSize: 11, fontWeight: '600', color: '#DC2626' },
});