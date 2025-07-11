import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface GaugeProps {
  value: number; // e.g. 1200 RPM
  max?: number; // e.g. 3000 RPM
}

export default function Gauge({ value, max = 3000 }: GaugeProps) {
  const progress = Math.min(value / max, 1);

  return (
    <View style={styles.container}>
      <ProgressChart
        data={{ data: [progress] }}
        width={screenWidth * 0.6}
        height={180}
        strokeWidth={14}
        radius={45}
        chartConfig={{
          backgroundGradientFrom: '#0D0D0D',
          backgroundGradientTo: '#0D0D0D',
          color: () => '#00B0FF',
        }}
        hideLegend={true}
      />
      <View style={styles.center}>
        <Text style={styles.rpm}>{value} RPM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  center: {
    position: 'absolute',
    top: 70,
    alignItems: 'center',
  },
  rpm: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
