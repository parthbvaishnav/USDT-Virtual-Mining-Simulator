import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '../../constants/colors'
import Header from '../../components/Header'
import { horizontalScale, verticalScale } from '../../constants/helper'
import { helpData } from './helpData'
import { Images } from '../../assets/images'
import CustomStatusBar from '../../components/CustomStatusBar'

export default function HelpScreen() {

  const [openIndex, setOpenIndex] = useState(null);

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.itemContainer}>
        <CustomStatusBar dark backgroundColor={Colors.white} />
        <Text style={styles.titleText1}>{item.title}</Text>

        {item?.questionList?.map((itm, indx) => {
          const currentIndex = `${index}-${indx}`; // unique key for each Q

          return (
            <Pressable
              key={currentIndex}
              style={styles.pressableContainer}
              onPress={() => {
                setOpenIndex(openIndex === currentIndex ? null : currentIndex);
              }}
            >
              <View
                style={[
                  styles.queContainer,
                  { marginTop: openIndex === currentIndex ? verticalScale(10) : 0 },
                ]}
              >
                <Text style={styles.queText}>{itm.que}</Text>
                <Image
                  style={[
                    styles.dropIcon,
                    { transform: [{ rotate: openIndex === currentIndex ? '90deg' : '270deg' }] },
                  ]}
                  source={Images.backIcon}
                />
              </View>

              {openIndex === currentIndex ? (
                <View style={styles.ansContainer}>
                  <Text style={styles.ansText}>{itm.ans}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header ishelp={false} />
      <Text style={styles.titleText}>Help Center</Text>
      <Text
        style={styles.descText}
      >
        {'Hey there! Looks like you need help.\nFind your answer here.'}
      </Text>
      <FlatList
        data={helpData}
        renderItem={renderItem}
      />

    </View>
  )
}

const styles = StyleSheet.create({
  queContainer: {
    paddingHorizontal: horizontalScale(15),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dropIcon: {
    height: verticalScale(15),
    width: verticalScale(15),
    resizeMode: 'contain',
    transform: [{ rotate: '270deg' }]
  },
  queText: {
    color: Colors.black,
    fontWeight: '600'
  },
  ansContainer: {
    marginVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(15),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  ansText: {
    color: Colors.grey_500,
    fontSize: verticalScale(12)
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  titleText: {
    color: Colors.black,
    textAlign: 'center',
    fontSize: verticalScale(18),
    fontWeight: '500',
    marginTop: verticalScale(15)
  },
  descText: {
    color: Colors.grey_500,
    textAlign: 'center',
    marginTop: verticalScale(15)
  },
  itemContainer: {
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(20)
  },
  titleText1: {
    color: Colors.black,
    fontWeight: '500',
    fontSize: verticalScale(15),
    textDecorationLine: 'underline'
  },
  pressableContainer: {
    width: '100%',
    minHeight: verticalScale(50),
    borderRadius: verticalScale(15),
    borderWidth: verticalScale(1.5),
    borderColor: Colors.grey_500,
    marginTop: verticalScale(10),
    alignSelf: 'center',
    justifyContent: 'center'
  },
})