import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { MSSV } from '../config';
import DishCard from '../components/DishCard';
const tr = (lang, en, vi) => lang === 'en' ? en : vi;
export default function DishesScreen({ dishes, categories, onSelect, onAdd, onRefresh, loading, lang, onLanguage }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('default');
  const [minPrice,setMinPrice] = useState('');
  const [maxPrice,setMaxPrice] = useState('');
  const invalidRange = (minPrice.trim() && (!Number.isFinite(Number(minPrice)) || Number(minPrice)<0)) || (maxPrice.trim() && (!Number.isFinite(Number(maxPrice)) || Number(maxPrice)<0)) || (minPrice.trim() && maxPrice.trim() && Number(minPrice)>Number(maxPrice));
  const shown = useMemo(() => {
    const list = dishes.filter(x => !invalidRange && x.name.toLowerCase().includes(search.trim().toLowerCase()) && (cat === 'all' || x.categoryId === cat) && (!availableOnly || x.isAvailable) && (!minPrice.trim() || x.price>=Number(minPrice)) && (!maxPrice.trim() || x.price<=Number(maxPrice)));
    if (sort === 'asc') list.sort((a,b) => a.price-b.price);
    if (sort === 'desc') list.sort((a,b) => b.price-a.price);
    if (sort === 'time') list.sort((a,b) => a.preparationTime-b.preparationTime);
    return list;
  }, [dishes, search, cat, availableOnly, sort, minPrice, maxPrice, invalidRange]);
  const tag = (label, active, onPress) => <Pressable key={label} style={[s.tag,active && s.tagOn]} onPress={onPress}><Text style={[s.tagText,active && s.tagTextOn]}>{label}</Text></Pressable>;
  return <View style={s.screen}>
    <View style={s.header}>
      <View><Text style={s.title}>Food Manager</Text><Text style={s.note}>{MSSV} · {shown.length} {tr(lang,'dishes','món ăn')}</Text></View>
      <Pressable style={s.lang} onPress={onLanguage}><Text style={{fontWeight:'700'}}>{lang === 'en' ? '🇻🇳 VI' : '🇬🇧 EN'}</Text></Pressable>
    </View>
    <FlatList data={shown} keyExtractor={x => x.apiId} onRefresh={onRefresh} refreshing={loading}
      contentContainerStyle={{padding:16,paddingBottom:96,flexGrow:1}}
      ListHeaderComponent={<>
        <TextInput style={s.search} value={search} onChangeText={setSearch} placeholder={tr(lang,'Search dishes...','Tìm món ăn...')} />
        <Text style={s.label}>{tr(lang,'Category','Loại món')}</Text>
        <View style={s.tags}>{tag(tr(lang,'All','Tất cả'),cat==='all',()=>setCat('all'))}{categories.map(c=>tag(c.name,cat===c.id,()=>setCat(c.id)))}</View>
        <View style={s.tags}>{tag(tr(lang,'Available only','Chỉ đang bán'),availableOnly,()=>setAvailableOnly(v=>!v))}</View>
        <Text style={s.label}>{tr(lang,'Price range (VND)','Khoảng giá (VNĐ)')}</Text>
        <View style={{flexDirection:'row',gap:8}}><TextInput style={[s.search,{flex:1}]} placeholder={tr(lang,'Min price','Giá từ')} keyboardType='numeric' value={minPrice} onChangeText={setMinPrice}/><TextInput style={[s.search,{flex:1}]} placeholder={tr(lang,'Max price','Giá đến')} keyboardType='numeric' value={maxPrice} onChangeText={setMaxPrice}/></View>
        {!!invalidRange&&<Text style={{color:'#b91c1c'}}>{tr(lang,'Invalid price range','Khoảng giá không hợp lệ')}</Text>}
        <Text style={s.label}>{tr(lang,'Sort','Sắp xếp')}</Text>
        <View style={s.tags}>{[['default',tr(lang,'Default','Mặc định')],['asc',tr(lang,'Price ↑','Giá ↑')],['desc',tr(lang,'Price ↓','Giá ↓')],['time',tr(lang,'Quickest','Nhanh nhất')]].map(([id,label])=>tag(label,sort===id,()=>setSort(id)))}</View>
        <Text style={s.label}>{tr(lang,'Dish list','Danh sách món ăn')}</Text>
      </>}
      renderItem={({item})=><DishCard dish={item} categoryName={categories.find(c=>c.id===item.categoryId)?.name} onPress={()=>onSelect(item)} lang={lang}/>}
      ListEmptyComponent={<Text style={{textAlign:'center',color:'#64748b',marginTop:40}}>{tr(lang,'No matching dishes','Không tìm thấy món ăn')}</Text>}/>
    <Pressable style={s.fab} onPress={onAdd}><Text style={{color:'white',fontWeight:'800',fontSize:17}}>+ {tr(lang,'Add dish','Thêm món')}</Text></Pressable>
  </View>;
}
const s = StyleSheet.create({screen:{flex:1,backgroundColor:'#f4f7fa'},header:{padding:18,paddingTop:28,backgroundColor:'white',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},title:{fontSize:26,fontWeight:'900',color:'#16324c'},note:{color:'#64748b',marginTop:5},lang:{backgroundColor:'#eaf2fb',padding:10,borderRadius:12},search:{backgroundColor:'white',borderColor:'#dfe5ed',borderWidth:1,borderRadius:12,padding:12,marginBottom:12},label:{fontSize:15,fontWeight:'800',color:'#243b53',marginVertical:9},tags:{flexDirection:'row',flexWrap:'wrap',gap:7,marginBottom:5},tag:{backgroundColor:'#fff',borderRadius:20,paddingHorizontal:12,paddingVertical:8,borderWidth:1,borderColor:'#dee6ee'},tagOn:{backgroundColor:'#1b73b9',borderColor:'#1b73b9'},tagText:{color:'#45596e',fontSize:12},tagTextOn:{color:'#fff',fontWeight:'700'},fab:{position:'absolute',bottom:20,right:20,backgroundColor:'#1b73b9',paddingHorizontal:22,paddingVertical:14,borderRadius:25,elevation:4}});
