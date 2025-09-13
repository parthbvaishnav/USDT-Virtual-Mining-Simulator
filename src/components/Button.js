import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { verticalScale } from '../constants/helper';
import { Colors } from '../constants/colors';

export default function Button(props) {

    const { style, icon, title, titleStyle, onPress, disabled } = props;
    return (
        <TouchableOpacity style={style} onPress={onPress} disabled={disabled}>
            {icon}
            <Text
                style={[
                    titleStyle,
                    styles.titleText
                ]}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    titleText: {
        lineHeight: verticalScale(24),
        fontSize: verticalScale(18),
        color: Colors.white,
    },
})
