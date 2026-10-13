import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const money = (n) => `₱${Number(n || 0).toFixed(2)}`;
const cleanName = (name) => String(name || '').replace(/\n/g, ' ');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtDate = (d) => d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (d) => d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });

// HTML version of the receipt, used for Print / Share PDF
function receiptHtml(r) {
  const rows = r.items
    .map(
      (i) =>
        `<tr><td>${esc(cleanName(i.name))}</td><td class="c">${i.quantity}x</td><td class="r">${money(i.price * i.quantity)}</td></tr>`
    )
    .join('');

  return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#111;max-width:320px;margin:0 auto;padding:16px}
h1{font-size:18px;text-align:center;margin:0}
.sub{text-align:center;font-size:12px;color:#555;margin:2px 0 10px}
hr{border:0;border-top:1px dashed #888;margin:10px 0}
table{width:100%;border-collapse:collapse;font-size:13px}
td{padding:3px 0;vertical-align:top}
.c{text-align:center;width:36px}
.r{text-align:right;white-space:nowrap}
.tot td{font-weight:bold;font-size:14px}
.foot{text-align:center;font-size:11px;color:#555;margin-top:12px}
</style></head><body>
<h1>GREEN PASTURES CAFÉ</h1>
<div class="sub">Tagum City, Davao del Norte</div>
<hr/>
<table>
<tr><td>Order #</td><td class="r">${esc(r.orderNumber ?? '-')}</td></tr>
<tr><td>Date</td><td class="r">${fmtDate(r.date)}</td></tr>
<tr><td>Time</td><td class="r">${fmtTime(r.date)}</td></tr>
<tr><td>Cashier</td><td class="r">${esc(r.cashier || 'Unknown')}</td></tr>
</table>
<hr/>
<table>${rows}</table>
<hr/>
<table>
<tr class="tot"><td>TOTAL</td><td class="r">${money(r.total)}</td></tr>
<tr><td>Payment (${esc(r.paymentMode)})</td><td class="r">${r.paid != null ? money(r.paid) : '-'}</td></tr>
<tr><td>Change</td><td class="r">${r.change != null ? money(r.change) : '-'}</td></tr>
</table>
<hr/>
<div class="foot">Thank you for supporting our small business!</div>
</body></html>`;
}

const RcRow = ({ label, value, bold }) => (
  <View style={styles.rcRow}>
    <Text style={[styles.rcText, bold && styles.rcBold]}>{label}</Text>
    <Text style={[styles.rcText, bold && styles.rcBold]}>{value}</Text>
  </View>
);

export default function PaymentScreen({
  orders = [],
  totalPrice = 0,
  cashierName,
  orderNumber,
  onBack,
  onVoid,
  onPaymentComplete,
  onDone,
}) {
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [capturingProof, setCapturingProof] = useState(false);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const now = new Date();
  const dateText = fmtDate(now);
  const timeText = fmtTime(now);

  const addNumber = (number) => {
    if (number === '.' && amount.includes('.')) return;
    setAmount((current) => current + number);
  };

  const backspace = () => {
    setAmount((current) => current.slice(0, -1));
  };

  // Receipt button: shows a preview of the current order
  const openPreview = () => {
    if (orders.length === 0) {
      Alert.alert('Nothing to show', 'Add items to the order first.');
      return;
    }
    const paid = Number(amount);
    setReceipt({
      orderNumber,
      date: new Date(),
      items: orders,
      total: totalPrice,
      paymentMode,
      paid: paid > 0 ? paid : null,
      change: paid > 0 && paid >= totalPrice ? paid - totalPrice : null,
      cashier: cashierName,
      final: false,
    });
  };

  // Closing a final receipt finishes the sale and returns to the order screen
  const closeReceipt = () => {
    const wasFinal = receipt?.final;
    setReceipt(null);
    if (wasFinal) onDone?.();
  };

  const finishPayment = async (paid, proofUri) => {
    const change = paid - totalPrice;
    setSaving(true);

    let result = null;
    try {
      result = await onPaymentComplete?.({
        paymentMode,
        amountPaid: paid,
        change,
        proofUri,
      });
    } catch (e) {
      setSaving(false);
      Alert.alert('Payment not saved', e?.message || 'Please try again.');
      return;
    }

    setSaving(false);
    setReceipt({
      orderNumber: result?.orderNumber ?? null,
      date: result?.date instanceof Date ? result.date : new Date(),
      items: orders,
      total: totalPrice,
      paymentMode,
      paid,
      change,
      cashier: cashierName,
      final: true,
    });
  };

  const captureGCashProof = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera needed', 'Camera access is required to capture G-Cash payment proof.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      allowsEditing: false,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const enterPayment = async () => {
    const paid = Number(amount);

    if (!paid) {
      Alert.alert('Payment Required', 'Please enter payment received.');
      return;
    }

    if (paid < totalPrice) {
      Alert.alert(
        'Insufficient Payment',
        `Total Price: ₱${totalPrice}\nPayment Received: ₱${paid}`
      );
      return;
    }

    if (paymentMode === 'G-Cash') {
      setCapturingProof(true);
      const proofUri = await captureGCashProof();
      setCapturingProof(false);

      if (!proofUri) {
        Alert.alert('Proof required', 'Please take a photo of the G-Cash payment confirmation to continue.');
        return;
      }

      await finishPayment(paid, proofUri);
      return;
    }

    await finishPayment(paid, null);
  };

  const handleVoid = () => {
    Alert.alert(
      'Void Order',
      'Are you sure you want to void this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Void',
          style: 'destructive',
          onPress: () => {
            if (onVoid) onVoid();
          },
        },
      ]
    );
  };

  // Share as PDF (phone) or open the browser print dialog (web)
  const sharePdf = async () => {
    try {
      const html = receiptHtml(receipt);
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share receipt' });
      } else {
        Alert.alert('Receipt saved', uri);
      }
    } catch (e) {
      Alert.alert('Could not create receipt', e?.message || 'Please try again.');
    }
  };

  const printReceipt = async () => {
    try {
      await Print.printAsync({ html: receiptHtml(receipt) });
    } catch (e) {
      Alert.alert('Could not print', e?.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.orderSection}>

        <View style={styles.header}>
          <Text style={styles.orderNumber}>
            Order: #{orderNumber ?? '...'}
          </Text>
          <Text style={styles.date}>
            {dateText}{'\n'}
            {timeText}
          </Text>
        </View>

        <ScrollView style={styles.items} showsVerticalScrollIndicator={true}>
          {orders.length === 0 ? (
            <Text style={styles.noItems}>No items ordered yet.</Text>
          ) : (
            orders.map((item) => (
              <View style={styles.item} key={item.id}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.quantity}>{item.quantity}x</Text>
                <Text style={styles.itemPrice}>₱ {item.price * item.quantity}.00</Text>
              </View>
            ))
          )}
        </ScrollView>

        <Text style={styles.total}>Total Price: ₱ {totalPrice}.00</Text>
        <Text style={styles.paymentInfo}>Mode of Payment: {paymentMode}</Text>
        <Text style={styles.paymentInfo}>Payment Received: ₱ {amount || '0.00'}</Text>
        <Text style={styles.cashier}>On Duty: {cashierName || 'Unknown'}</Text>

      </View>

      <View style={styles.paymentSection}>

        <View style={styles.paymentTypes}>
          <TouchableOpacity
            style={[styles.paymentButton, paymentMode === 'G-Cash' && styles.selectedPayment]}
            onPress={() => setPaymentMode('G-Cash')}
            disabled={saving}
          >
            <Text style={styles.buttonText}>G-Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentButton, paymentMode === 'Cash' && styles.selectedPayment]}
            onPress={() => setPaymentMode('Cash')}
            disabled={saving}
          >
            <Text style={styles.buttonText}>Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.paymentButton} onPress={handleVoid} disabled={saving}>
            <Text style={styles.buttonText}>Void</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.keypad}>

          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((k) => (
            <TouchableOpacity key={k} style={styles.key} onPress={() => addNumber(k)}>
              <Text style={styles.keyText}>{k}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.key} onPress={backspace}>
            <Text style={styles.deleteText}>⌫</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.key} onPress={openPreview}>
            <Text style={styles.smallButtonText}>Receipt 🖨</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.key}
            onPress={enterPayment}
            disabled={capturingProof || saving}
          >
            {capturingProof || saving
              ? <ActivityIndicator color="#333" />
              : <Text style={styles.smallButtonText}>Enter ↵</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.key} onPress={onBack} disabled={saving}>
            <Text style={styles.smallButtonText}>← Return</Text>
          </TouchableOpacity>

        </View>

      </View>

      <Modal visible={!!receipt} transparent animationType="fade" onRequestClose={closeReceipt}>
        <View style={styles.rcOverlay}>
          {receipt ? (
            <View style={styles.rcCard}>

              <ScrollView style={styles.rcScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.rcPaper}>

                  <Text style={styles.rcTitle}>GREEN PASTURES CAFÉ</Text>
                  <Text style={styles.rcSub}>Tagum City, Davao del Norte</Text>
                  {!receipt.final ? (
                    <Text style={styles.rcPreview}>PREVIEW — NOT YET PAID</Text>
                  ) : null}
                  {receipt.final && receipt.orderNumber == null ? (
                    <Text style={styles.rcWarn}>⚠ Sale could not be saved to the database. Check the connection.</Text>
                  ) : null}

                  <View style={styles.rcLine} />

                  <RcRow label="Order #" value={receipt.orderNumber ?? '—'} />
                  <RcRow label="Date" value={fmtDate(receipt.date)} />
                  <RcRow label="Time" value={fmtTime(receipt.date)} />
                  <RcRow label="Cashier" value={receipt.cashier || 'Unknown'} />

                  <View style={styles.rcLine} />

                  {receipt.items.map((item) => (
                    <View key={item.id} style={styles.rcRow}>
                      <Text style={styles.rcItemName}>{cleanName(item.name)}</Text>
                      <Text style={styles.rcItemQty}>{item.quantity}x</Text>
                      <Text style={styles.rcItemAmt}>{money(item.price * item.quantity)}</Text>
                    </View>
                  ))}

                  <View style={styles.rcLine} />

                  <RcRow label="TOTAL" value={money(receipt.total)} bold />
                  <RcRow label={`Payment (${receipt.paymentMode})`} value={receipt.paid != null ? money(receipt.paid) : '—'} />
                  <RcRow label="Change" value={receipt.change != null ? money(receipt.change) : '—'} />

                  <View style={styles.rcLine} />

                  <Text style={styles.rcThanks}>Thank you for supporting our small business!</Text>

                </View>
              </ScrollView>

              <View style={styles.rcButtons}>
                <TouchableOpacity style={styles.rcBtn} onPress={sharePdf}>
                  <Text style={styles.rcBtnText}>Share PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rcBtn} onPress={printReceipt}>
                  <Text style={styles.rcBtnText}>Print</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.rcBtn, styles.rcBtnPrimary]} onPress={closeReceipt}>
                  <Text style={[styles.rcBtnText, styles.rcBtnPrimaryText]}>
                    {receipt.final ? 'Done' : 'Close'}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          ) : null}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#555555', padding: 7 },
  orderSection: {
    height: 335,
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    borderTopWidth: 3,
    borderTopColor: '#B8860B',
    borderBottomWidth: 5,
    borderBottomColor: '#B8860B',
    padding: 10,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  orderNumber: { fontSize: 12, fontWeight: 'bold' },
  date: { fontSize: 8, fontWeight: 'bold', textAlign: 'right' },
  items: { marginTop: 20, maxHeight: 125 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 48 },
  itemName: { width: 105, fontSize: 10, fontWeight: 'bold' },
  quantity: { width: 50, fontSize: 10, fontWeight: 'bold' },
  itemPrice: { fontSize: 10, fontWeight: 'bold' },
  noItems: { textAlign: 'center', marginTop: 40, color: '#777', fontSize: 13 },
  total: { marginTop: 12, fontSize: 11, fontWeight: 'bold' },
  paymentInfo: { marginTop: 7, fontSize: 10, fontWeight: 'bold' },
  cashier: { marginTop: 10, fontSize: 10, fontWeight: 'bold' },
  paymentSection: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    marginTop: 5,
    borderRadius: 10,
    borderTopWidth: 3,
    borderTopColor: '#B8860B',
    padding: 18,
  },
  paymentTypes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  paymentButton: {
    width: '30%', height: 42, backgroundColor: '#C0B0B0',
    borderWidth: 1, borderColor: '#777', borderRadius: 5,
    justifyContent: 'center', alignItems: 'center',
  },
  selectedPayment: { borderWidth: 2, borderColor: '#333' },
  buttonText: { fontSize: 10, fontWeight: 'bold' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  key: {
    width: '30%', height: 42, backgroundColor: '#B09F9F',
    borderWidth: 1, borderColor: '#777', borderRadius: 5,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  keyText: { fontSize: 20, fontWeight: 'bold' },
  smallButtonText: { fontSize: 10, fontWeight: 'bold' },
  deleteText: { fontSize: 20, fontWeight: 'bold' },

  rcOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  rcCard: { width: '100%', maxWidth: 360, maxHeight: '92%' },
  rcScroll: { flexGrow: 0, flexShrink: 1 },
  rcPaper: { backgroundColor: '#FFFFFF', borderRadius: 6, padding: 18 },
  rcTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  rcSub: { fontSize: 11, color: '#555', textAlign: 'center', marginTop: 2 },
  rcPreview: { fontSize: 11, fontWeight: 'bold', color: '#B45309', textAlign: 'center', marginTop: 8 },
  rcWarn: { fontSize: 11, fontWeight: 'bold', color: '#DC2626', textAlign: 'center', marginTop: 8 },
  rcLine: { height: 1, backgroundColor: '#CCCCCC', marginVertical: 10 },
  rcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  rcText: { fontSize: 12, color: '#111' },
  rcBold: { fontWeight: 'bold', fontSize: 14 },
  rcItemName: { flex: 1, fontSize: 12 },
  rcItemQty: { width: 34, fontSize: 12, textAlign: 'center' },
  rcItemAmt: { width: 78, fontSize: 12, textAlign: 'right' },
  rcThanks: { fontSize: 11, color: '#555', textAlign: 'center' },
  rcButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  rcBtn: { flex: 1, backgroundColor: '#E5E7EB', paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  rcBtnText: { fontSize: 12, fontWeight: '700' },
  rcBtnPrimary: { backgroundColor: '#5d4738' },
  rcBtnPrimaryText: { color: '#FFFFFF' },
});