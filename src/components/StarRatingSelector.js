import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export default function StarRatingSelector({ 
  max = 6, 
  value = 0, 
  onChange, 
  activeColor = theme.colors.primary 
}) {
  return (
    <View style={styles.container}>
      {Array.from({ length: max }).map((_, index) => {
        const ratingValue = index + 1;
        const isActive = ratingValue <= value;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => onChange(ratingValue)}
            style={[
              styles.dot,
              { 
                backgroundColor: isActive ? activeColor : '#334155',
                borderColor: isActive ? activeColor : '#475569',
                shadowColor: isActive ? activeColor : 'transparent',
                shadowOpacity: isActive ? 0.5 : 0,
                shadowRadius: 4,
              }
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a', // Fondo muy oscuro
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%'
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  }
});
