import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function ReportsScreen({ salesHistory = [], onBack }) {

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Sales Reports</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>

        {salesHistory.length === 0 ? (

          <Text style={styles.emptyText}>No sales recorded yet.</Text>

        ) : (

          salesHistory
            .slice()
            .reverse()
            .map((sale) => (

              <View key={sale.id} style={styles.card}>

                <View style={styles.cardHeader}>
                  <Text style={styles.date}>{sale.date}</Text>
                  <Text style={styles.paymentMode}>{sale.paymentMode}</Text>
                </View>

                {sale.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>{item.quantity}x</Text>
                    <Text style={styles.itemPrice}>
                      ₱{item.price * item.quantity}.00
                    </Text>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>₱{sale.total}.00</Text>
                </View>

              </View>

            ))

        )}

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555555',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#BBBBBB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  backText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#DDD',
    marginTop: 40,
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 6,
  },
  date: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  paymentMode: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 11,
  },
  itemQty: {
    width: 30,
    fontSize: 11,
  },
  itemPrice: {
    width: 60,
    fontSize: 11,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 6,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});