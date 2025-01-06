import React from 'react';
import {
    Modal,
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    Image
} from 'react-native';
import { ThemedView, ThemedText } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { SubscriptionService, PREDEFINED_SERVICES } from '@/app/types/service';
import { FontAwesome } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';

interface ServiceSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (service: SubscriptionService | null) => void;
}

export function ServiceSelectionModal({
    visible,
    onClose,
    onSelect
}: ServiceSelectionModalProps) {
    const { colors } = useTheme();
    const { t } = useLanguage();

    const renderServiceItem = ({ item }: { item: SubscriptionService }) => (
        <TouchableOpacity
            style={styles.serviceItem}
            onPress={() => onSelect(item)}
            accessibilityLabel={t('selectService', { service: item.name })}
        >
            <Image source={item.logo} style={styles.serviceLogo} />
            <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
        </TouchableOpacity>
    );

    const renderCategory = ({ item }: { item: ServiceCategory }) => (
        <View style={styles.categoryContainer}>
            <ThemedText style={styles.categoryTitle}>{t(`category_${item.id}`)}</ThemedText>
            <View style={styles.servicesGrid}>
                {item.services.map((service) => (
                    <TouchableOpacity
                        key={service.id}
                        style={styles.serviceItem}
                        onPress={() => onSelect(service)}
                        accessibilityLabel={t('selectService', { service: service.name })}
                    >
                        <Image source={service.logo} style={styles.serviceLogo} />
                        <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
            accessibilityLabel={t('selectSubscriptionService')}
        >
            <View style={styles.modalOverlay}>
                <ThemedView style={[styles.container, { backgroundColor: colors.card.background }]}>
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>{t('selectService')}</ThemedText>
                        <TouchableOpacity 
                            onPress={onClose}
                            accessibilityLabel={t('close')}
                        >
                            <FontAwesome name="times" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.defaultOption}
                        onPress={() => onSelect(null)}
                        accessibilityLabel={t('addCustomExpense')}
                    >
                        <FontAwesome name="plus" size={24} color={colors.text} />
                        <ThemedText style={styles.defaultText}>{t('addCustomExpense')}</ThemedText>
                    </TouchableOpacity>

                    <FlatList
                        data={PREDEFINED_SERVICES}
                        renderItem={renderCategory}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.servicesList}
                        showsVerticalScrollIndicator={false}
                    />
                </ThemedView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        maxHeight: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    defaultOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        backgroundColor: 'rgba(128,128,128,0.1)', // Light gray in both modes
        marginBottom: 20,
    },
    defaultText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    servicesList: {
        paddingBottom: 20,
    },
    categoryContainer: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 8,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: 4,
    },
    serviceItem: {
        width: '45%', // Approximately 2 items per row with spacing
        alignItems: 'center',
        padding: 15,
        margin: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(128,128,128,0.1)', // Light gray in both modes
    },
    serviceLogo: {
        width: 60,
        height: 60,
        marginBottom: 8,
        borderRadius: 12,
    },
    serviceName: {
        fontSize: 14,
        textAlign: 'center',
    },
});

export { ServiceSelectionModal };
