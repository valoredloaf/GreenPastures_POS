import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';

// Splits a formatted "Oct 8, 2026, 10:15 AM" string into
// a date key ("Oct 8, 2026") and a time label ("10:15 AM").
function splitDateTime(dateStr) {
  const parts = (dateStr || '').split(',');
  const time = parts.pop()?.trim() || '';
  const date = parts.join(',').trim() || dateStr || 'Unknown date';
  return { date, time };
}

function groupByDate(salesHistory) {
  const groups = {};

  salesHistory.forEach((sale) => {
    const { date, time } = splitDateTime(sale.date);
    if (!groups[date]) groups[date] = { date, sales: [], total: 0 };
    groups[date].sales.push({ ...sale, time });
    groups[date].total += sale.total || 0;
  });

  // Most recent date first
  return Object.values(groups).reverse();
}

// Small payment-proof thumbnail; falls back to a gray box if the image can't load
function ProofThumb({ uri, onPress }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={[styles.thumb, styles.thumbFailed]}>
        <Text style={styles.thumbFailedText}>No{'\n'}photo</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.thumbWrap}>
      <Image
        source={{ uri }}
        style={styles.thumb}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
      <Text style={styles.thumbCaption}>Tap to enlarge</Text>
    </TouchableOpacity>
  );
}

export default function ReportsScreen({ salesHistory = [], onBack }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const grouped = useMemo(() => groupByDate(salesHistory), [salesHistory]);

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Sales Reports</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>

        {grouped.length === 0 ? (

          <Text style={styles.emptyText}>No sales recorded yet.</Text>

        ) : (

          grouped.map((group) => (

            <View key={group.date} style={styles.dateCard}>

              <View style={styles.dateHeader}>
                <Text style={styles.dateLabel}>{group.date}</Text>
                <Text style={styles.grandTotal}>Grand Total: ₱{group.total}.00</Text>
              </View>

              {group.sales.map((sale) => (
                <View key={sale.id} style={styles.saleRow}>

                  <View style={styles.saleHeader}>
                    <Text style={styles.saleTime}>
                      {sale.time}{sale.orderNumber ? `  ·  Order #${sale.orderNumber}` : ''}
                    </Text>
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

                  <View style={styles.saleFooter}>
                    <Text style={styles.saleTotal}>₱{sale.total}.00</Text>
                    {sale.proofUrl ? (
                      <ProofThumb
                        uri={sale.proofUrl}
                        onPress={() => setPreviewUrl(sale.proofUrl)}
                      />
                    ) : null}
                  </View>

                </View>
              ))}

            </View>

          ))

        )}

      </ScrollView>

      <Modal visible={!!previewUrl} transparent animationType="fade" onRequestClose={() => setPreviewUrl(null)}>
        <View style={styles.previewRoot}>
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewUrl(null)}>
            <Text style={styles.previewCloseText}>Close ✕</Text>
          </TouchableOpacity>
          {previewUrl ? (
            <Image source={{ uri: previewUrl }} style={styles.previewImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>

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
  backButton: {
    backgroundColor: '#BBBBBB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  backText: { fontSize: 12, fontWeight: '600' },
  list: { flex: 1 },
  emptyText: { textAlign: 'center', color: '#DDD', marginTop: 40, fontSize: 13 },

  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#5d4738',
  },
  dateLabel: { fontSize: 13, fontWeight: 'bold' },
  grandTotal: { fontSize: 13, fontWeight: 'bold', color: '#5d4738' },

  saleRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  saleTime: { fontSize: 11, fontWeight: 'bold', color: '#6B7280' },
  paymentMode: { fontSize: 11, fontWeight: '600', color: '#2563EB' },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemName: { flex: 1, fontSize: 11 },
  itemQty: { width: 30, fontSize: 11 },
  itemPrice: { width: 60, fontSize: 11, textAlign: 'right' },
  saleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  saleTotal: { fontSize: 12, fontWeight: 'bold' },

  thumbWrap: { alignItems: 'center' },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  thumbCaption: { fontSize: 9, color: '#2563EB', marginTop: 2 },
  thumbFailed: { justifyContent: 'center', alignItems: 'center', borderColor: '#CCC' },
  thumbFailedText: { fontSize: 9, color: '#888', textAlign: 'center' },

  previewRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: '100%', height: '80%' },
  previewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  previewCloseText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});