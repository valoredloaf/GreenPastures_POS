import React, { useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function PaymentScreen({
  orders = [],
  totalPrice = 0,
  onBack,
  onVoid,
  onPaymentComplete,
}) {
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');

  const addNumber = number => {
    // Prevent more than one decimal point
    if (number === '.' && amount.includes('.')) {
      return;
    }

    setAmount(current => current + number);
  };
  
  const backspace = () => {
    setAmount(current => current.slice(0, -1));
  };

  const enterPayment = () => {
    const paid = Number(amount);

    if (!paid) {
      Alert.alert(
        'Payment Required',
        'Please enter payment received.'
      );
      return;
    }

    if (paid < totalPrice) {
      Alert.alert(
        'Insufficient Payment',
        `Total Price: ₱${totalPrice}\nPayment Received: ₱${paid}`
      );
      return;
    }

    const change = paid - totalPrice;

    Alert.alert(
      'Payment Successful',
      `Total Price: ₱${totalPrice}\nPayment Received: ₱${paid}\nChange: ₱${change.toFixed(2)}`,
      [
        {
          text: 'OK',
          onPress: () => {
            onPaymentComplete?.({
              paymentMode,
              amountPaid: paid,
              change,
            });
          },
        },
      ]
    );
  };

  const handleVoid = () => {
    Alert.alert(
      'Void Order',
      'Are you sure you want to void this order?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Void',
          style: 'destructive',
          onPress: () => {
            if (onVoid) {
              onVoid();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.orderSection}>

        {/* HEADER */}

        <View style={styles.header}>

          <Text style={styles.orderNumber}>
            Order: #110
          </Text>

          <Text style={styles.date}>
            Sept. 14, 2026{'\n'}
            1:15 PM
          </Text>

        </View>

        {/* ORDER ITEMS */}

        <ScrollView
          style={styles.items}
          showsVerticalScrollIndicator={true}
        >

          {orders.length === 0 ? (

            <Text style={styles.noItems}>
              No items ordered yet.
            </Text>

          ) : (

            orders.map(item => (

              <View
                style={styles.item}
                key={item.id}
              >

                <Text style={styles.itemName}>
                  {item.name}
                </Text>

                <Text style={styles.quantity}>
                  {item.quantity}x
                </Text>

                <Text style={styles.itemPrice}>
                  ₱ {item.price * item.quantity}.00
                </Text>

              </View>

            ))

          )}

        </ScrollView>

        {/* TOTAL PRICE */}

        <Text style={styles.total}>
          Total Price: ₱ {totalPrice}.00
        </Text>

        {/* MODE OF PAYMENT */}

        <Text style={styles.paymentInfo}>
          Mode of Payment: {paymentMode}
        </Text>

        {/* PAYMENT RECEIVED */}

        <Text style={styles.paymentInfo}>
          Payment Received: ₱ {amount || '0.00'}
        </Text>

        {/* CASHIER */}

        <Text style={styles.cashier}>
          On Duty: Jhone RheyMhar Damas
        </Text>

      </View>

      <View style={styles.paymentSection}>


        <View style={styles.paymentTypes}>

          <TouchableOpacity
            style={[
              styles.paymentButton,
              paymentMode === 'G-Cash' &&
                styles.selectedPayment,
            ]}
            onPress={() => setPaymentMode('G-Cash')}
          >
            <Text style={styles.buttonText}>
              G-Cash
            </Text>
          </TouchableOpacity>


          {/* CASH */}

          <TouchableOpacity
            style={[
              styles.paymentButton,
              paymentMode === 'Cash' &&
                styles.selectedPayment,
            ]}
            onPress={() => setPaymentMode('Cash')}
          >
            <Text style={styles.buttonText}>
              Cash
            </Text>
          </TouchableOpacity>


          {/* VOID */}

          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handleVoid}
          >
            <Text style={styles.buttonText}>
              Void
            </Text>
          </TouchableOpacity>

        </View>


        <View style={styles.keypad}>


          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('1')}
          >
            <Text style={styles.keyText}>1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('2')}
          >
            <Text style={styles.keyText}>2</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('3')}
          >
            <Text style={styles.keyText}>3</Text>
          </TouchableOpacity>


          {/* ROW 2 — 4 5 6 */}

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('4')}
          >
            <Text style={styles.keyText}>4</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('5')}
          >
            <Text style={styles.keyText}>5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('6')}
          >
            <Text style={styles.keyText}>6</Text>
          </TouchableOpacity>


          {/* ROW 3 — 7 8 9 */}

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('7')}
          >
            <Text style={styles.keyText}>7</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('8')}
          >
            <Text style={styles.keyText}>8</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('9')}
          >
            <Text style={styles.keyText}>9</Text>
          </TouchableOpacity>


          {/* ROW 4 — . 0 DELETE */}

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('.')}
          >
            <Text style={styles.keyText}>
              .
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.key}
            onPress={() => addNumber('0')}
          >
            <Text style={styles.keyText}>
              0
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.key}
            onPress={backspace}
          >
            <Text style={styles.deleteText}>
              ⌫
            </Text>
          </TouchableOpacity>


          {/* ROW 5 — RECEIPT / ENTER / RETURN */}

          <TouchableOpacity
            style={styles.key}
            onPress={() => {
              Alert.alert(
                'Receipt',
                'Receipt printed.'
              );
            }}
          >
            <Text style={styles.smallButtonText}>
              Receipt 🖨
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.key}
            onPress={enterPayment}
          >
            <Text style={styles.smallButtonText}>
              Enter ↵
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.key}
            onPress={onBack}
          >
            <Text style={styles.smallButtonText}>
              ← Return
            </Text>
          </TouchableOpacity>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  // MAIN CONTAINER

  container: {
    flex: 1,
    backgroundColor: '#555555',
    padding: 7,
  },

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


  // HEADER

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  orderNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  date: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'right',
  },


  items: {
    marginTop: 20,
    maxHeight: 125,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 10,

    paddingHorizontal: 48,
  },

  itemName: {
    width: 105,
    fontSize: 10,
    fontWeight: 'bold',
  },

  quantity: {
    width: 50,
    fontSize: 10,
    fontWeight: 'bold',
  },

  itemPrice: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  noItems: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
    fontSize: 13,
  },

  total: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: 'bold',
  },


  paymentInfo: {
    marginTop: 7,
    fontSize: 10,
    fontWeight: 'bold',
  },

  cashier: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: 'bold',
  },


  paymentSection: {
    flex: 1,

    backgroundColor: '#D9D9D9',

    marginTop: 5,

    borderRadius: 10,

    borderTopWidth: 3,
    borderTopColor: '#B8860B',

    padding: 18,
  },

  menuButton: {
    alignSelf: 'flex-end',

    width: 35,
    height: 30,

    backgroundColor: '#BEBEBE',

    borderRadius: 5,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 18,
  },

  menuText: {
    fontSize: 21,
    fontWeight: 'bold',
  },

  paymentTypes: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginBottom: 15,
  },

  paymentButton: {
    width: '30%',
    height: 42,

    backgroundColor: '#C0B0B0',

    borderWidth: 1,
    borderColor: '#777',

    borderRadius: 5,

    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedPayment: {
    borderWidth: 2,
    borderColor: '#333',
  },

  buttonText: {
    fontSize: 10,
    fontWeight: 'bold',
  },


  keypad: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'space-between',
  },

  key: {
    width: '30%',
    height: 42,

    backgroundColor: '#B09F9F',

    borderWidth: 1,
    borderColor: '#777',

    borderRadius: 5,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 8,
  },

  keyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  smallButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  deleteText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

});