import React from 'react';
import { ScrollView, View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { key } from '../config';
const tr=(l,e,v)=>l==='en'?e:v;
export default function DishDetailScreen({dish,category,onBack,onEdit,onDelete,lang}) {
  const img = dish.images || [];
  return <ScrollView style={s.root} contentContainerStyle={{padding:18,paddingBottom:48}}>
    <Pressable onPress={onBack}><Text style={s.link}>← {tr(lang,'Back','Quay lại')}</Text></Pressable>
    <Text style={s.name}>{dish.name}</Text>
    <Text style={s.meta}>{category?.name || '—'} · {dish.preparationTime} min · {dish.preparationTime <= 15 ? 'Quick' : 'Regular'}</Text>
    <Text style={s.price}>{dish.price.toLocaleString('vi-VN')} đ</Text>
    <Text style={{color:dish.isAvailable?'#14804a':'#ad3232',marginBottom:16}}>{dish.isAvailable?tr(lang,'Available','Đang bán'):tr(lang,'Unavailable','Ngừng bán')}</Text>
    <Text style={s.heading}>{tr(lang,'Images','Hình ảnh')}</Text>
    {img.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:10}}>{img.map((item,i)=>
      <View key={i} style={{marginRight:10}}><Image source={{uri:item[key('ImageUrl')]}} style={s.image}/>{(item[key('IsThumbnail')]===true || item[key('IsThumbnail')]==='true') && <Text style={s.badge}>{tr(lang,'Cover','Ảnh đại diện')}</Text>}</View>)}</ScrollView> : <Text style={s.muted}>{tr(lang,'No images','Chưa có ảnh')}</Text>}
    <Text style={s.heading}>{tr(lang,'Description','Mô tả')}</Text><Text style={s.muted}>{dish.description || '—'}</Text>
    <Pressable style={s.button} onPress={onEdit}><Text style={s.white}>{tr(lang,'Edit dish','Sửa món')}</Text></Pressable>
    <Pressable style={[s.button,{backgroundColor:'#bd3742'}]} onPress={onDelete}><Text style={s.white}>{tr(lang,'Delete dish','Xóa món')}</Text></Pressable>
  </ScrollView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#f4f7fa'},link:{color:'#1769aa',fontWeight:'700',marginBottom:20},name:{fontWeight:'900',fontSize:26,color:'#15304c'},meta:{color:'#64748b',marginTop:10},price:{fontSize:22,fontWeight:'800',color:'#1769aa',marginVertical:10},heading:{fontWeight:'800',marginTop:20,fontSize:17,color:'#243b53'},image:{width:195,height:145,borderRadius:12},badge:{fontSize:11,color:'#147b49'},muted:{color:'#65778b',marginTop:10,lineHeight:23},button:{backgroundColor:'#1b73b9',padding:15,borderRadius:12,marginTop:18,alignItems:'center'},white:{color:'white',fontWeight:'800'}});
