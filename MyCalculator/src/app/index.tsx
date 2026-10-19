
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';

const buttons = [
  ['C', '()', '%', '/'],
  ['7', '8', '9', 'x'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export default function CalculatorScreen() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);

  const calculate = (input: string) => {
    const cleaned = input
      .replace(/x/g, '*')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

    if (!cleaned || !/^[0-9+\-*/().\s]+$/.test(cleaned)) {
      throw new Error('Invalid expression');
    }

    // Only calculator characters are accepted.
    const value = Function(`"use strict"; return (${cleaned})`)();

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error('Invalid result');
    }

    return String(Number(value.toPrecision(10)));
  };

  const pressButton = (button: string) => {
    if (button === 'C') {
      setExpression('');
      setResult('0');
      setJustCalculated(false);
      return;
    }

    if (button === '=') {
      if (!expression) return;

      try {
        const answer = calculate(expression);
        setHistory((old) => [
          `${expression} = ${answer}`,
          ...old,
        ].slice(0, 20));
        setResult(answer);
        setExpression(answer);
        setJustCalculated(true);
      } catch {
        setResult('Error');
        setJustCalculated(false);
      }
      return;
    }

    if (button === '()') {
      const opens =
        (expression.match(/\(/g) || []).length;
      const closes =
        (expression.match(/\)/g) || []).length;
      const next =
        opens > closes && /[\d)%]$/.test(expression)
          ? ')'
          : '(';

      setExpression((old) =>
        justCalculated ? next : old + next
      );
      setJustCalculated(false);
      return;
    }

    if (button === '%') {
      if (justCalculated) {
        setExpression(result + '%');
      } else {
        setExpression((old) => old + '%');
      }
      setJustCalculated(false);
      return;
    }

    setExpression((old) => {
      const current = justCalculated
        ? ''
        : old;

      if (button === '.') {
        const lastNumber = current.split(/[+\-*/()%]/).pop() || '';
        if (lastNumber.includes('.')) return current;
        return current + '.';
      }

      if (['+', '-', '/', 'x'].includes(button)) {
        if (!current && button !== '-') return current;

        if (/[+\-*/]$/.test(current)) {
          return current.slice(0, -1) + button;
        }
      }

      return current + button;
    });

    setJustCalculated(false);
  };

  const deleteLast = () => {
    setExpression((old) => old.slice(0, -1));
    setResult('0');
    setJustCalculated(false);
  };

  const displayResult = () => {
    if (!expression) return '0';

    try {
      return calculate(expression);
    } catch {
      return result === 'Error' ? 'Error' : '';
    }
  };

  const renderButton = (button: string) => {
    const isClear = button === 'C';
    const isEqual = button === '=';
    const isOperator = ['/', 'x', '-', '+'].includes(button);
    const isSpecial = ['()', '%'].includes(button);
    const isZero = button === '0';

    return (
      <TouchableOpacity
        key={button}
        activeOpacity={0.7}
        onPress={() => pressButton(button)}
        style={[
          styles.button,
          isZero && styles.zeroButton,
          isClear && styles.clearButton,
          isEqual && styles.equalButton,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            (isClear || isEqual) && styles.highlightText,
            isOperator && styles.operatorText,
            isSpecial && styles.specialText,
          ]}
        >
          {button}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.yellowShape} />
      <View style={styles.yellowShapeBottom} />

      <View style={styles.calculator}>
        <View style={styles.display}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expressionContent}
          >
            <Text style={styles.expression}>
              {expression || ' '}
            </Text>
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.resultContent}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.result}
            >
              {displayResult()}
            </Text>
          </ScrollView>

          <View style={styles.displayTools}>
            <TouchableOpacity
              onPress={() => setShowHistory(!showHistory)}
              style={styles.toolButton}
            >
              <Text style={styles.toolIcon}>◷</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowHistory(!showHistory)}
              style={styles.toolButton}
            >
              <Text style={styles.toolIcon}>▧</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              onPress={deleteLast}
              style={styles.toolButton}
            >
              <Text style={styles.deleteIcon}>◆</Text>
              <Text style={styles.deleteX}>×</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showHistory ? (
          <View style={styles.historyPanel}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>History</Text>
              <TouchableOpacity
                onPress={() => setHistory([])}
              >
                <Text style={styles.clearHistory}>Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList}>
              {history.length === 0 ? (
                <Text style={styles.emptyHistory}>
                  No calculations yet
                </Text>
              ) : (
                history.map((item, index) => (
                  <TouchableOpacity
                    key={`${item}-${index}`}
                    onPress={() => {
                      const parts = item.split(' = ');
                      setExpression(parts[0]);
                      setResult(parts[1]);
                      setShowHistory(false);
                      setJustCalculated(true);
                    }}
                  >
                    <Text style={styles.historyItem}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowHistory(false)}
            >
              <Text style={styles.backText}>Back to calculator</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.keypad}>
            {buttons.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={styles.buttonRow}
              >
                {row.map((button) => renderButton(button))}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f4a0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  yellowShape: {
    position: 'absolute',
    width: 350,
    height: 650,
    backgroundColor: '#e8ed35',
    top: -150,
    left: -185,
    transform: [{ rotate: '42deg' }],
  },
  yellowShapeBottom: {
    position: 'absolute',
    width: 320,
    height: 400,
    backgroundColor: '#e8ed35',
    bottom: -280,
    right: -175,
    transform: [{ rotate: '42deg' }],
  },
  calculator: {
    width: '100%',
    maxWidth: 380,
    height: '88%',
    maxHeight: 720,
    backgroundColor: '#fffef5',
    borderRadius: 23,
    paddingHorizontal: 11,
    paddingTop: 20,
    paddingBottom: 12,
    elevation: 14,
    shadowColor: '#585800',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 5, height: 9 },
  },
  display: {
    flex: 1,
    minHeight: 150,
    paddingHorizontal: 5,
  },
  expressionContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    minWidth: '100%',
  },
  expression: {
    fontSize: 17,
    color: '#222222',
    textAlign: 'right',
  },
  resultContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    minWidth: '100%',
    paddingTop: 4,
  },
  result: {
    fontSize: 32,
    fontWeight: '500',
    color: '#171717',
    textAlign: 'right',
    width: '100%',
  },
  displayTools: {
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d7d6ce',
    marginTop: 'auto',
    marginBottom: 10,
  },
  toolButton: {
    width: 30,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },
  toolIcon: {
    fontSize: 20,
    color: '#333333',
  },
  deleteIcon: {
    fontSize: 18,
    color: '#171717',
  },
  deleteX: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fffef5',
  },
  keypad: {
    flex: 1.15,
    justifyContent: 'space-between',
    paddingTop: 1,
  },
  buttonRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#e9e9e7',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zeroButton: {
    flex: 2.15,
  },
  clearButton: {
    backgroundColor: '#171d1d',
  },
  equalButton: {
    backgroundColor: '#171d1d',
  },
  buttonText: {
    color: '#171717',
    fontSize: 25,
    fontWeight: '400',
  },
  highlightText: {
    color: '#eff500',
    fontWeight: '500',
  },
  operatorText: {
    fontSize: 27,
  },
  specialText: {
    fontSize: 23,
  },
  historyPanel: {
    flex: 1.15,
    paddingHorizontal: 5,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#171717',
  },
  clearHistory: {
    color: '#6b6d00',
    fontSize: 15,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    fontSize: 17,
    color: '#222222',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e4dc',
  },
  emptyHistory: {
    color: '#777777',
    paddingVertical: 20,
    fontSize: 15,
  },
  backButton: {
    backgroundColor: '#e9e9e7',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  backText: {
    fontSize: 15,
    color: '#171717',
  },
});
