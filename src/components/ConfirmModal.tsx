import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
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
          <PixelPanel label={title}>
            <PixelText>{message}</PixelText>
            <View style={styles.row}>
              <PixelButton label="Cancel" tone="ghost" onPress={onCancel} style={{ flex: 1 }} />
              <PixelButton label={confirmLabel} tone="rose" onPress={onConfirm} style={{ flex: 1 }} />
            </View>
          </PixelPanel>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,6,24,0.82)', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
