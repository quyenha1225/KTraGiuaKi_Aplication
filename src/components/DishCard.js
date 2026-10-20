import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { key } from '../config';
const thumbnail = (images = []) => (Array.isArray(images) ? images : []).find(x => x[key('IsThumbnail')] === true || x[key('IsThumbnail')] === 'true') || (Array.isArray(images) ? images[0] : null);
export default function DishCard({ dish, categoryName, onPress, lang = 'en' }) {
  const cover = thumbnail(dish.images)?.[key('ImageUrl')];
  const quick = Number(dish.preparationTime) <= 15;
  return <Pressable style={styles.card} onPress={onPress}>
    {cover ? <Image source={{ uri: cover }} style={styles.photo} resizeMode="cover" /> : <View style={[styles.photo,styles.placeholder]}><Text style={{fontSize:42}}>🍽️</Text></View>}
    <View style={styles.content}>
      <Text style={styles.category}>{categoryName || (lang==='en'?'Food':'Món ăn')}</Text>
      <Text style={styles.title} numberOfLines={2}>{dish.name || 'Unnamed'}</Text>
      <View style={styles.meta}><Text style={styles.time}>◷  {dish.preparationTime} {lang==='en'?'min':'phút'}</Text><Text style={[styles.pill,quick?styles.quick:styles.regular]}>{quick?'⚡ Quick':'Regular'}</Text></View>
      <View style={styles.footer}><Text style={styles.price}>{Number(dish.price||0).toLocaleString('vi-VN')}₫</Text><Text style={[styles.status,{color:dish.isAvailable?'#087B50':'#BC4755'}]}>{dish.isAvailable?'● '+(lang==='en'?'Available':'Đang bán'):'● '+(lang==='en'?'Unavailable':'Ngừng bán')}</Text></View>
    </View>
  </Pressable>;
}
const styles=StyleSheet.create({
  card:{backgroundColor:'#fff',borderRadius:22,marginBottom:14,flexDirection:'row',padding:11,borderWidth:1,borderColor:'#EDF0F4',shadowColor:'#11203B',shadowOpacity:0.065,shadowRadius:14,shadowOffset:{width:0,height:5},elevation:2},
  photo:{width:126,height:145,borderRadius:16},placeholder:{backgroundColor:'#FFF1E8',justifyContent:'center',alignItems:'center'},
  content:{flex:1,paddingLeft:15,justifyContent:'space-around'},category:{fontSize:11,fontWeight:'800',letterSpacing:1.2,textTransform:'uppercase',color:'#EA794E'},
  title:{fontSize:19,fontWeight:'900',color:'#172A3A',lineHeight:24},meta:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:8},time:{fontSize:12,color:'#6F7E8D'},pill:{fontSize:10,overflow:'hidden',borderRadius:9,paddingHorizontal:8,paddingVertical:4,fontWeight:'800'},quick:{color:'#B2620A',backgroundColor:'#FFF1D9'},regular:{color:'#65758C',backgroundColor:'#EFF3F7'},
  footer:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:5},price:{color:'#E16A3F',fontSize:19,fontWeight:'900'},status:{fontSize:10,fontWeight:'700'}
});
