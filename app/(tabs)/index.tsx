import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(View);
const { width, height } = Dimensions.get('window');
const MAX_STAMINA = 5.0;
const COLS = 6;
const ROWS = 9;
const BOX_WIDTH = width / COLS;
const BOX_HEIGHT = height / 11;
const COLORS = ['blue', 'green', 'gray', 'red'];

const levelMaps = [
  [
    'blue', 'blue', 'blue', 'blue', 'blue', 'blue',
    'blue', 'green', 'green', 'grey', 'green', 'blue',
    'blue', 'grey', 'red', 'red', 'green', 'blue',
    'blue', 'green', 'red', 'red', 'grey', 'blue',
    'blue', 'grey', 'red', 'red', 'green', 'blue',
    'blue', 'green', 'red', 'red', 'grey', 'blue',
    'blue', 'grey', 'red', 'red', 'green', 'blue',
    'blue', 'green', 'grey', 'green', 'green', 'blue',
    'blue', 'blue', 'blue', 'blue', 'blue', 'blue',
  ],
  [
    'blue', 'blue', 'blue', 'blue', 'blue', 'blue',
    'blue', 'grey', 'red', 'red', 'grey', 'blue',
    'blue', 'red', 'red', 'red', 'red', 'blue',
    'blue', 'red', 'green', 'green', 'red', 'blue',
    'blue', 'green', 'green', 'green', 'red', 'blue',
    'blue', 'red', 'red', 'red', 'green', 'blue',
    'blue', 'grey', 'red', 'red', 'grey', 'blue',
    'blue', 'green', 'grey', 'grey', 'green', 'blue',
    'blue', 'blue', 'blue', 'blue', 'blue', 'blue',
  ],
  [
    'red', 'blue', 'blue', 'blue', 'blue', 'red',
    'blue', 'grey', 'red', 'red', 'grey', 'blue',
    'red', 'red', 'red', 'red', 'red', 'blue',
    'blue', 'red', 'green', 'green', 'red', 'blue',
    'blue', 'green', 'green', 'green', 'red', 'blue',
    'red', 'red', 'red', 'red', 'green', 'blue',
    'blue', 'grey', 'red', 'red', 'grey', 'blue',
    'blue', 'green', 'red', 'grey', 'green', 'blue',
    'red', 'blue', 'blue', 'blue', 'blue', 'red',
  ]
];

export default function App() {
  const generateGrid = () =>
    Array.from({ length: ROWS * COLS }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);

  const getInitialGrid = (level) => {
    if (level <= 3) return [...levelMaps[level - 1]];
    return generateGrid();
  };

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState(getInitialGrid(1));
  const [gameOver, setGameOver] = useState(false);
  const [lastIndex, setLastIndex] = useState(null);
  const [stamina, setStamina] = useState(MAX_STAMINA);
  const staminaInterval = useRef(null);

  const scanAnim = useRef(new Animated.Value(2)).current;

  // 激光扫描动画效果
  useEffect(() => {
    scanAnim.setValue(2);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: ROWS,
          duration: 2500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(scanAnim, {
          toValue: 2,
          duration: 2500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (gameOver) {
      if (staminaInterval.current) clearInterval(staminaInterval.current);
      return;
    }
    staminaInterval.current = setInterval(() => {
      setStamina((prev) => {
        const next = Math.max(prev - 0.1, 0);
        if (next <= 0) {
          clearInterval(staminaInterval.current);
          setGameOver(true);
          Alert.alert('Out of Stamina', 'You stayed in the air too long.', [
            { text: 'Restart', onPress: () => resetGame() },
          ]);
        }
        return next;
      });
    }, 100);
    return () => {
      if (staminaInterval.current) clearInterval(staminaInterval.current);
    };
  }, [gameOver]);

  const handlePress = (index) => {
    if (gameOver) return;
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    if (lastIndex !== null) {
      const lastRow = Math.floor(lastIndex / COLS);
      const lastCol = lastIndex % COLS;
      const dx = Math.abs(col - lastCol);
      const dy = Math.abs(row - lastRow);
      if (dx > 1 || dy > 1) {
        Alert.alert('Too far', 'You must move one square at a time.', [
          { text: 'OK' },
        ]);
        setStamina(MAX_STAMINA);
        return;
      }
    }
    setLastIndex(index);
    setStamina(MAX_STAMINA);
    const color = grid[index];
    if (color === 'green') {
      const newGrid = [...grid];
      newGrid[index] = 'gray';
      setGrid(newGrid);
      setScore(score + 1);
      const remainingGreen = newGrid.filter((c) => c === 'green').length;
      if (remainingGreen === 0) {
        if (level < 3) {
          Alert.alert('Level Clear', `You passed level ${level}!`, [
            { text: 'Next Level', onPress: () => nextLevel() },
          ]);
        } else {
          Alert.alert('Endless Mode', 'You completed all levels!', [
            { text: 'Continue', onPress: () => nextLevel() },
          ]);
        }
      }
    } else if (color === 'gray') {
      setScore(score - 1);
    } else if (color === 'red') {
      setGameOver(true);
      Alert.alert('Game Over', `You stepped on red\nScore: ${score}`, [
        { text: 'Restart', onPress: () => resetGame() },
      ]);
    }
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setGrid(getInitialGrid(1));
    setGameOver(false);
    setStamina(MAX_STAMINA);
    setLastIndex(null);
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    setGrid(getInitialGrid(next));
    setGameOver(false);
    setStamina(MAX_STAMINA);
    setLastIndex(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 顶部体力条 */}
      <View style={styles.staminaBarContainer}>
        <View style={[styles.staminaBar, { width: `${(stamina / MAX_STAMINA) * 100}%` }]} />
      </View>
      {/* 顶部 UI */}
      <View style={styles.topBar}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.score}>Level: {level <= 3 ? level : '∞'}</Text>
        <Pressable onPress={resetGame} style={styles.button}>
          <Text style={styles.buttonText}>Restart</Text>
        </Pressable>
      </View>
      {/* 扫描激光线 */}
      <AnimatedPressable
        pointerEvents="box-only" // 关键: 允许第一层被点击
        style={[styles.laserLine, {
          transform: [
            {
              translateY: scanAnim.interpolate({
                inputRange: [2, ROWS],
                outputRange: [BOX_HEIGHT * 2, BOX_HEIGHT * ROWS],
              }),
            },
          ],
        }]}
        onStartShouldSetResponder={() => true} // 确保可以响应
        onResponderRelease={() => {
          if (!gameOver) {
            setGameOver(true);
            Alert.alert('Game Over', 'You touched the laser!', [
              { text: 'Restart', onPress: () => resetGame() },
            ]);
          }
        }}
      />


      {/* 游戏区域 */}
      <View style={styles.grid}>
        {grid.map((color, index) => (
          <TouchableWithoutFeedback key={index} onPress={() => handlePress(index)}>
            <View
              style={{
                width: BOX_WIDTH,
                height: BOX_HEIGHT,
                backgroundColor: color || '#ddd',
                borderWidth: 2,
                borderColor: index === lastIndex ? 'yellow' : '#999',
              }}
            />
          </TouchableWithoutFeedback>
        ))}
      </View>
      {gameOver && <Text style={styles.over}>You Lost</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  staminaBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: '#eee',
    marginTop: 2,
  },
  staminaBar: {
    height: '100%',
    backgroundColor: 'green',
  },
  topBar: {
    height: BOX_HEIGHT,
    width: '100%',
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  score: {
    fontSize: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  over: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 28,
    color: 'red',
    fontWeight: 'bold',
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BOX_HEIGHT,
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
    zIndex: 10,
  },
});
