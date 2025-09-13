import { View, Image, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { horizontalScale, verticalScale } from '../constants/helper'
import { Images } from '../assets/images'
import { Colors } from '../constants/colors'
import { useNavigation } from '@react-navigation/native'

export default function Header({ ishelp, onBackPress }) {
    const navigation = useNavigation()
    
    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigation.goBack();
        }
    };
    
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.btnContainer} onPress={handleBackPress}>
                <Image
                    style={styles.iconStyle}
                    source={Images.backIcon}
                />
            </TouchableOpacity>
            {ishelp ?
                <Pressable
                    onPress={() => navigation.navigate('HelpScreen')}
                    style={styles.iconContainer}
                >
                    <Image style={styles.imageStyle} source={Images.Question} />
                </Pressable> : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: verticalScale(10),
    },
    btnContainer: {
        height: verticalScale(35),
        width: verticalScale(35),
        backgroundColor: Colors.textDisabled,
        borderRadius: verticalScale(35),
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconStyle: {
        height: verticalScale(17),
        width: verticalScale(17),
        resizeMode: 'contain'
    },
    iconContainer: {
        overflow: 'hidden',
        backgroundColor: Colors.white,
        height: verticalScale(35),
        width: verticalScale(35),
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        padding: 6
    },
    imageStyle: {
        flex: 1,
        resizeMode: "center",
        height: verticalScale(35),
        width: verticalScale(35),
    },
})