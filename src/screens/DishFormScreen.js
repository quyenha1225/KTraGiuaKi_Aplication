import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Switch } from 'react-native';
import { key } from '../config';
const tr=(l,e,v)=>l==='en'?e:v;
export default function DishFormScreen({ initial, categories, dishes, onBack, onSave, saving, lang }) {
  const [name,setName] = useState(initial?.name || '');
  const [price,setPrice] = useState(initial ? String(initial.price) : '');
  const [time,setTime] = useState(initial ? String(initial.preparationTime) : '');
  const [description,setDescription] = useState(initial?.description || '');
  const [categoryId,setCategoryId] = useState(initial?.categoryId || categories[0]?.id || '');
  const [available,setAvailable] = useState(initial?.isAvailable ?? true);
  const [images,setImages] = useState(initial?.images || []);
  const [imageUrl,setImageUrl] = useState('');
  const [error,setError] = useState('');
  const field=(label,value,setter,numeric=false,multi=false)=><View style={{marginBottom:14}}><Text style={s.label}>{label}</Text><TextInput value={value} onChangeText={setter} style={[s.input,multi&&{height:90,textAlignVertical:'top'}]} keyboardType={numeric?'decimal-pad':'default'} multiline={multi}/></View>;
  const addImage = () => {
    const value=imageUrl.trim();
    if (!/^https?:\/\//i.test(value)) {setError(tr(lang,'Enter a valid HTTP(S) image URL','Nhập URL ảnh HTTP(S) hợp lệ'));return;}
    if (images.some(i=>i[key('ImageUrl')] === value)) {setError(tr(lang,'Image already exists','Ảnh đã tồn tại'));return;}
    setImages(old=>[...old,{[key('ImageUrl')]:value,[key('IsThumbnail')]:old.length===0}]);setImageUrl('');setError('');
  };
  const makeCover=index=>setImages(old=>old.map((x,i)=>({...x,[key('IsThumbnail')]:i===index})));
  const removeImage=index=>setImages(old=>{const next=old.filter((_,i)=>i!==index);if(next.length&&!next.some(x=>x[key('IsThumbnail')]))next[0]={...next[0],[key('IsThumbnail')]:true};return next;});
  const submit=()=>{
    const title=name.trim(), p=Number(price), t=Number(time);
    if(!title){setError(tr(lang,'Name is required','Tên món không được trống'));return;}
    if(!price.trim()||!Number.isFinite(p)||p<=0){setError(tr(lang,'Price must be greater than zero','Giá phải lớn hơn 0'));return;}
    if(!time.trim()||!Number.isFinite(t)||t<=0){setError(tr(lang,'Preparation time must be greater than zero','Thời gian phải lớn hơn 0'));return;}
    if(!categories.some(c=>c.id===categoryId)){setError(tr(lang,'Please select a category','Vui lòng chọn loại món hợp lệ'));return;}
    if(dishes.some(x=>(x.apiId||x.localId)!==(initial?.apiId||initial?.localId)&&x.categoryId===categoryId&&x.name.trim().toLowerCase()===title.toLowerCase())) {setError(tr(lang,'Dish name already exists in this category','Tên món đã tồn tại trong loại món này'));return;}
    setError('');onSave({apiId:initial?.apiId,localId:initial?.localId,id:initial?.id||`DISH${Date.now()}`,name:title,price:p,preparationTime:t,description,categoryId,isAvailable:available,images});
  };
  return <ScrollView style={s.root} contentContainerStyle={{padding:18,paddingBottom:42}} keyboardShouldPersistTaps="handled">
    <Pressable onPress={onBack}><Text style={s.back}>← {tr(lang,'Back','Quay lại')}</Text></Pressable>
    <Text style={s.title}>{initial?tr(lang,'Edit dish','Sửa món'):tr(lang,'Add new dish','Thêm món mới')}</Text>
    {field(tr(lang,'Dish name','Tên món'),name,setName)}
    {field(tr(lang,'Price (VND)','Giá (VNĐ)'),price,setPrice,true)}
    {field(tr(lang,'Preparation time (min)','Thời gian chế biến (phút)'),time,setTime,true)}
    {field(tr(lang,'Description','Mô tả'),description,setDescription,false,true)}
    <Text style={s.label}>{tr(lang,'Category','Loại món')}</Text>
    <View style={s.choices}>{categories.map(c=><Pressable key={c.apiId} style={[s.choice,c.id===categoryId&&s.selected]} onPress={()=>setCategoryId(c.id)}><Text style={{color:c.id===categoryId?'#fff':'#34435b'}}>{c.name}</Text></Pressable>)}</View>
    <View style={s.row}><Text style={s.label}>{tr(lang,'Available','Đang bán')}</Text><Switch value={available} onValueChange={setAvailable}/></View>
    <Text style={s.label}>{tr(lang,'Image URLs','Ảnh món ăn (URL)')}</Text>
    <View style={s.row}><TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." style={[s.input,{flex:1,marginRight:8}]}/><Pressable onPress={addImage} style={s.add}><Text style={{color:'white'}}>+</Text></Pressable></View>
    {images.map((image,i)=><View key={i} style={s.imageRow}><Text numberOfLines={1} style={{flex:1,color:'#334155'}}>{image[key('ImageUrl')]}</Text><Pressable onPress={()=>makeCover(i)}><Text style={{color:'#146db2'}}>{image[key('IsThumbnail')]? '★ Cover':'☆ Cover'}</Text></Pressable><Pressable onPress={()=>removeImage(i)}><Text style={{color:'#c43b48'}}>  ✕</Text></Pressable></View>)}
    {!!error&&<Text style={s.error}>{error}</Text>}
    <Pressable disabled={saving} style={[s.save,saving&&{opacity:.5}]} onPress={submit}><Text style={{color:'#fff',fontWeight:'800'}}>{saving?tr(lang,'Saving...','Đang lưu...'):tr(lang,'Save dish','Lưu món')}</Text></Pressable>
  </ScrollView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#f7f9fb'},back:{color:'#1b73b9',fontWeight:'700',marginBottom:18},title:{fontSize:24,fontWeight:'900',color:'#16324c',marginBottom:18},label:{color:'#34435b',fontWeight:'700',marginBottom:7},input:{backgroundColor:'white',borderWidth:1,borderColor:'#dbe3ec',borderRadius:10,padding:12,minHeight:44},choices:{flexDirection:'row',gap:8,flexWrap:'wrap',marginBottom:16},choice:{padding:10,borderRadius:20,backgroundColor:'white',borderWidth:1,borderColor:'#dce4ed'},selected:{backgroundColor:'#1b73b9'},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},add:{backgroundColor:'#1b73b9',padding:14,borderRadius:10},imageRow:{flexDirection:'row',alignItems:'center',gap:8,marginVertical:7},error:{color:'#bb2639',fontWeight:'600',marginTop:14},save:{marginTop:20,backgroundColor:'#1b73b9',borderRadius:12,alignItems:'center',padding:16}});
