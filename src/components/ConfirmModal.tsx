import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { PixelButton } from './PixelButton';
import { PixelPanel } from './PixelPanel';
import { PixelText } from './PixelText';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ visible, title, message, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <PixelPanel title={title}>
            <PixelText style={styles.message}>{message}</PixelText>
            <View style={styles.row}>
              <PixelButton label="Cancel" color={colors.parchmentDark} onPress={onCancel} style={{ flex: 1 }} />
              <PixelButton label={confirmLabel} color={colors.terracotta} onPress={onConfirm} style={{ flex: 1 }} />
            </View>
          </PixelPanel>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(26,18,32,0.75)', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  message: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
});
