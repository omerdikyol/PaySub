import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Modal, 
  View, 
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useTheme } from '../useTheme';

type BaseModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const BaseModal = ({ visible, onClose, children }: BaseModalProps) => {
  const { colors } = useTheme();
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const { height: windowHeight } = Dimensions.get('window');

  useEffect(() => {
    if (visible) {
      // Show modal
      Animated.parallel([
        // Fade in overlay
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Slide up modal
        Animated.spring(modalAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          mass: 1,
          stiffness: 300,
        }),
      ]).start();
    } else {
      // Hide modal
      Animated.parallel([
        // Fade out overlay
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        // Slide down modal
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]).start();
    }
  }, [visible]);

  const modalTranslateY = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [windowHeight, 0],
  });

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View 
            style={[
              styles.overlay,
              { backgroundColor: colors.overlay },
              { opacity: overlayAnim }
            ]} 
          />
        </TouchableWithoutFeedback>

        <Animated.View style={[
          styles.modalContent,
          { backgroundColor: colors.card.background },
          {
            opacity: modalAnim,
            transform: [{ translateY: modalTranslateY }]
          }
        ]}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
    minHeight: 200,
    maxHeight: '80%',
  },
}); 