import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { key } from '../config';
const thumbnail = (images = []) => images.find(x => x[key('IsThumbnail')] === true || x[key('IsThumbnail')] === 'true') || images[0];
export default function DishCard({ dish, categoryName, onPress, lang = 'en' }) {
  const cover = thumbnail(dish.images)?.[key('ImageUrl')];
  return <Pressable style={styles.card} onPress={onPress}>
    {cover ? <Image source={{ uri: cover }} style={styles.photo} /> : <View style={[styles.photo, styles.placeholder]}><Text style={{fontSize:28}}>🍽️</Text></View>}
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{dish.name || (lang === 'en' ? 'Unnamed' : 'Chưa có tên')}</Text>
      <Text style={styles.gray}>{categoryName || '—'} · {dish.preparationTime} min</Text>
      <Text style={styles.price}>{dish.price.toLocaleString('vi-VN')} đ</Text>
      <Text style={{ color: dish.isAvailable ? '#14804a' : '#b63c3c', fontSize:12, marginTop:5 }}>
        {dish.isAvailable ? (lang === 'en' ? 'Available' : 'Đang bán') : (lang === 'en' ? 'Unavailable' : 'Ngừng bán')}
      </Text>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({ card:{backgroundColor:'white',borderRadius:16,padding:12,marginBottom:12,flexDirection:'row',gap:13,borderWidth:1,borderColor:'#e8edf2'},photo:{width:86,height:92,borderRadius:12},placeholder:{backgroundColor:'#edf2f8',alignItems:'center',justifyContent:'center'}, title:{fontWeight:'800',fontSize:17,color:'#182438'},gray:{marginTop:5,color:'#64748b',fontSize:12},price:{fontWeight:'800',fontSize:16,color:'#1769aa',marginTop:8} });
