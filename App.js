import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, Text, Pressable, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DishesScreen from './src/screens/DishesScreen';
import DishDetailScreen from './src/screens/DishDetailScreen';
import DishFormScreen from './src/screens/DishFormScreen';
import { readCache, writeCache, queueSave, queueDelete, syncNow, pendingCount } from './src/services/sync';
const t = (lang,en,vi) => lang === 'en' ? en : vi;
export default function App() {
  const [screen,setScreen] = useState('list');
  const [lang,setLang] = useState('en');
  const [dishes,setDishes] = useState([]);
  const [categories,setCategories] = useState([]);
  const [selectedId,setSelectedId] = useState(null);
  const [busy,setBusy] = useState(false);
  const [online,setOnline] = useState(false);
  const [pending,setPending] = useState(0);
  const [error,setError] = useState('');
  const lock = useRef(false);
  const onlineRef = useRef(false);
  const dataRef = useRef({ dishes:[],categories:[] });
  const selected = dishes.find(d => (d.apiId || d.localId) === selectedId);
  const updateData = useCallback(async data => {
    dataRef.current = data;
    setDishes(data.dishes);setCategories(data.categories);
    await writeCache(data);
    setPending(await pendingCount());
  },[]);
  const refresh = useCallback(async () => {
    if (!onlineRef.current || lock.current) return;
    lock.current = true;setBusy(true);
    try { await updateData(await syncNow());setError(''); }
    catch(e) { setError(e.message || 'Sync failed'); }
    finally { lock.current=false;setBusy(false);setPending(await pendingCount()); }
  },[updateData]);
  useEffect(() => {
    let active = true;
    (async()=>{
      const language = await AsyncStorage.getItem('BIT242958_language');
      if (active && language==='vi') setLang('vi');
      const cached = await readCache();
      if (active) { dataRef.current=cached;setDishes(cached.dishes);setCategories(cached.categories);setPending(await pendingCount()); }
    })();
    const unsub = NetInfo.addEventListener(state => {
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
      onlineRef.current=connected;
      if(active){setOnline(connected);if (connected) refresh();}
    });
    return ()=>{active=false;unsub();};
  },[refresh]);
  const toggleLanguage = async () => {
    const next=lang==='en'?'vi':'en';setLang(next);
    await AsyncStorage.setItem('BIT242958_language',next);
  };
  const message = (title,body) => Platform.OS==='web' ? window.alert(`${title}\n${body}`) : Alert.alert(title,body);
  const persistDish = async dish => {
    if(lock.current) return;
    lock.current=true;setBusy(true);
    try {
      const saved=await queueSave(dish);
      const id=saved.apiId||saved.localId;
      const now=dataRef.current;
      const dishesNow=now.dishes.filter(d=>(d.apiId||d.localId)!==id).concat(saved);
      await updateData({...now,dishes:dishesNow});
      setScreen('list');setSelectedId(null);setError('');
    } catch(e) {message('Error',e.message||'Save failed');}
    finally {lock.current=false;setBusy(false);if(onlineRef.current) refresh();}
  };
  const remove = async () => {
    if(!selected||lock.current)return;
    lock.current=true;setBusy(true);
    try {
      await queueDelete(selected);
      const now=dataRef.current;
      await updateData({...now,dishes:now.dishes.filter(d=>(d.apiId||d.localId)!==(selected.apiId||selected.localId))});
      setScreen('list');setSelectedId(null);
    } catch(e) {message('Error',e.message||'Delete failed');}
    finally {lock.current=false;setBusy(false);if(onlineRef.current) refresh();}
  };
  const confirmDelete = () => {
    const prompt=t(lang,'Delete this dish?','Bạn muốn xóa món này?');
    if (Platform.OS==='web') {if(window.confirm(prompt))remove();}
    else Alert.alert(t(lang,'Confirm','Xác nhận'),prompt,[{text:t(lang,'Cancel','Hủy'),style:'cancel'},{text:t(lang,'Delete','Xóa'),style:'destructive',onPress:remove}]);
  };
  return <SafeAreaView style={{flex:1,backgroundColor:'#f4f7fa',paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0}}>
    <Pressable onPress={refresh} style={{backgroundColor:online?'#e1f5eb':'#fff1db',padding:7,alignItems:'center'}}>
      <Text style={{color:online?'#176c43':'#895100',fontSize:12}}>{online?t(lang,'Online','Có mạng'):t(lang,'Offline – changes saved locally','Ngoại tuyến – thay đổi lưu trên máy')}{pending?` · ${pending} ${t(lang,'pending','chờ đồng bộ')}`:''}{busy?' · ...':''}</Text>
    </Pressable>
    {!!error && <Text style={{backgroundColor:'#fee2e2',color:'#991b1b',padding:10}}>{error}</Text>}
    <View style={{flex:1,display:screen==='list'?'flex':'none'}}><DishesScreen dishes={dishes} categories={categories} lang={lang} onLanguage={toggleLanguage} loading={busy} onRefresh={refresh} onAdd={()=>setScreen('add')} onSelect={dish=>{setSelectedId(dish.apiId||dish.localId);setScreen('detail');}}/></View>
    {screen==='detail' && (selected ? <DishDetailScreen dish={selected} category={categories.find(c=>c.id===selected.categoryId)} lang={lang} onBack={()=>setScreen('list')} onEdit={()=>setScreen('edit')} onDelete={confirmDelete}/> : <Pressable onPress={()=>setScreen('list')}><Text>{t(lang,'Dish not found. Back','Không tìm thấy món. Quay lại')}</Text></Pressable>)}
    {(screen==='add'||screen==='edit') && <DishFormScreen key={`${screen}-${selectedId}`} initial={screen==='edit'?selected:null} categories={categories} dishes={dishes} lang={lang} onBack={()=>setScreen(screen==='edit'?'detail':'list')} onSave={persistDish} saving={busy}/>}
  </SafeAreaView>;
}
