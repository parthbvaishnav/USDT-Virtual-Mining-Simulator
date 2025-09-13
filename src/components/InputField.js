import { View, Text, TextInput, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import { verticalScale } from '../constants/helper';
import { Colors } from '../constants/colors';
import { Image } from 'react-native-animatable';

const { width } = Dimensions.get('window');

export default function InputField(props) {
    const { 
        title, 
        placeholder, 
        onChangeText, 
        errorTitle, 
        secureTextEntry, 
        rightIcon, 
        onRightIconPress,
        value,
        onBlur,
        keyboardType,
        autoCapitalize,
        ...otherProps 
    } = props;

    return (
        <>
            {title && <Text style={styles.titleText}>{title}</Text>}
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={Colors.shadeGrey}
                    onChangeText={onChangeText}
                    value={value}
                    onBlur={onBlur}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    style={[styles.inputContainer, rightIcon && styles.inputWithIcon]}
                    {...otherProps}
                />
                {rightIcon && (
                    <TouchableOpacity 
                        style={styles.iconContainer} 
                        onPress={onRightIconPress}
                        activeOpacity={0.7}
                    >
                        {/* <Text style={styles.iconText}>
                            {rightIcon === 'eye' ? '👁️' : '🙈'}
                        </Text> */}
                        <Image source={rightIcon === 'eye' ? require('../assets/images/eye.png') : require('../assets/images/hidden.png')} style={{width: 20, height: 20}} />
                    </TouchableOpacity>
                )}
            </View>
           <Text style={styles.errorText}>{errorTitle}</Text>
        </>
    )
}

const styles = StyleSheet.create({
    titleText: {
        color: Colors.black,
        marginLeft: 20,
        fontWeight: '500',
        marginBottom: verticalScale(-10),        
    },
    inputWrapper: {
        position: 'relative',
        width: "100%",
    },
    inputContainer: {
        width: "100%",
        height: verticalScale(45),
        borderWidth: verticalScale(1.2),
        borderColor: Colors.grey_500,
        paddingHorizontal: 10,
        backgroundColor: Colors.white,
        borderRadius: verticalScale(10)
    },
    inputWithIcon: {
        paddingRight: 45,
    },
    iconContainer: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -15 }],
        padding: 5,
    },
    iconText: {
        fontSize: 18,
    },
    errorText: {
        color: Colors.darkRed,
        fontSize: 12,
        marginTop: 5,
        marginHorizontal: 15,
        marginBottom: verticalScale(10),
    },
})
