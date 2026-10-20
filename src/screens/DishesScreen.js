
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { MSSV } from '../config';
import DishCard from '../components/DishCard';

const tr = (lang, en, vi) => (lang === 'en' ? en : vi);

export default function DishesScreen({
  dishes = [],
  categories = [],
  onSelect,
  onAdd,
  onRefresh,
  loading = false,
  lang = 'en',
  onLanguage,
}) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const min = minPrice.trim();
  const max = maxPrice.trim();

  const invalidRange =
    (min !== '' &&
      (!Number.isFinite(Number(min)) || Number(min) < 0)) ||
    (max !== '' &&
      (!Number.isFinite(Number(max)) || Number(max) < 0)) ||
    (min !== '' &&
      max !== '' &&
      Number(min) > Number(max));

  // Tim kiem, loc va sap xep mon an
  const shown = useMemo(() => {
    if (invalidRange) return [];

    const list = dishes.filter((dish) => {
      const name = String(dish.name || '').toLowerCase();

      const matchName = name.includes(
        search.trim().toLowerCase()
      );

      const matchCategory =
        cat === 'all' ||
        String(dish.categoryId) === String(cat);

      const matchAvailable =
        !availableOnly || dish.isAvailable === true;

      const price = Number(dish.price);

      const matchMin =
        min === '' || price >= Number(min);

      const matchMax =
        max === '' || price <= Number(max);

      return (
        matchName &&
        matchCategory &&
        matchAvailable &&
        matchMin &&
        matchMax
      );
    });

    if (sort === 'asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'time') {
      list.sort(
        (a, b) =>
          Number(a.preparationTime) -
          Number(b.preparationTime)
      );
    }

    return list;
  }, [
    dishes,
    search,
    cat,
    availableOnly,
    sort,
    min,
    max,
    invalidRange,
  ]);

  // Nut loc va sap xep
  const pill = (label, selected, action, key) => (
    <Pressable
      key={key || label}
      onPress={action}
      style={[
        styles.pill,
        selected && styles.pillSelected,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          selected && styles.pillSelectedText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const Header = () => (
    <>
      {/* Tieu de */}
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>
            ✦ FOOD STUDIO / {MSSV}
          </Text>

          <Text style={styles.header}>
            {tr(lang, 'Your food,', 'Món ngon,')}
            <Text style={styles.accent}>
              {tr(lang, ' simplified.', ' trong tầm tay.')}
            </Text>
          </Text>

          <Text style={styles.subheading}>
            {tr(
              lang,
              'Manage your menu effortlessly.',
              'Quản lý thực đơn thật dễ dàng.'
            )}
          </Text>
        </View>

        <Pressable
          onPress={onLanguage}
          style={styles.language}
        >
          <Text style={styles.languageText}>
            {lang === 'en' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </Text>
        </Pressable>
      </View>

      {/* Thong ke */}
      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroSmall}>
            {tr(
              lang,
              'MENU OVERVIEW',
              'TỔNG QUAN THỰC ĐƠN'
            )}
          </Text>

          <Text style={styles.heroBig}>
            {dishes.length}
            <Text style={styles.heroUnit}>
              {' '}
              {tr(lang, 'dishes', 'món ăn')}
            </Text>
          </Text>

          <Text style={styles.heroSmall}>
            ✦ {categories.length}{' '}
            {tr(lang, 'categories', 'danh mục')}
            {'  ·  '}
            {dishes.filter((d) => d.isAvailable).length}{' '}
            {tr(lang, 'available', 'đang bán')}
          </Text>
        </View>

        <Text style={styles.heroEmoji}>🍜</Text>
      </View>

      {/* Tieu de tim kiem */}
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionText}>
          {tr(lang, 'Explore dishes', 'Khám phá món ăn')}
        </Text>

        <Text style={styles.sectionCount}>
          {shown.length}{' '}
          {tr(lang, 'results', 'kết quả')}
        </Text>
      </View>

      {/* O tim kiem */}
      <View style={styles.searchWrap}>
        <Text style={styles.magnify}>⌕</Text>

        <TextInput
          style={styles.search}
          placeholder={tr(
            lang,
            'Search your favorite dishes...',
            'Tìm món ăn yêu thích...'
          )}
          placeholderTextColor="#9DA9B6"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Loc theo danh muc */}
      <Text style={styles.filterTitle}>
        {tr(lang, 'Categories', 'Danh mục')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryPills}
      >
        {pill(
          tr(lang, 'All dishes', 'Tất cả món'),
          cat === 'all',
          () => setCat('all'),
          'all'
        )}

        {categories.map((category) =>
          pill(
            category.name,
            String(cat) === String(category.id),
            () => setCat(String(category.id)),
            String(category.id)
          )
        )}
      </ScrollView>

      {/* Bo loc */}
      <View style={styles.filtersBox}>
        <Text style={styles.filterTitle}>
          {tr(lang, 'Filters', 'Bộ lọc')}
        </Text>

        <View style={styles.pills}>
          {pill(
            tr(
              lang,
              '✓ Available only',
              '✓ Chỉ đang bán'
            ),
            availableOnly,
            () => setAvailableOnly((v) => !v),
            'available'
          )}
        </View>

        {/* Khoang gia */}
        <Text style={styles.filterTitle}>
          {tr(lang, 'Price range', 'Khoảng giá')} (VND)
        </Text>

        <View style={styles.priceRow}>
          <TextInput
            style={styles.priceInput}
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder={tr(lang, 'Min price', 'Giá từ')}
          />

          <Text style={styles.dash}>—</Text>

          <TextInput
            style={styles.priceInput}
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder={tr(lang, 'Max price', 'Giá đến')}
          />
        </View>

        {invalidRange && (
          <Text style={styles.error}>
            {tr(
              lang,
              'Invalid price range',
              'Khoảng giá không hợp lệ'
            )}
          </Text>
        )}

        {/* Sap xep */}
        <Text style={styles.filterTitle}>
          {tr(lang, 'Sort by', 'Sắp xếp')}
        </Text>

        <View style={styles.pills}>
          {[
            ['default', tr(lang, 'Default', 'Mặc định')],
            ['asc', tr(lang, 'Price ↑', 'Giá ↑')],
            ['desc', tr(lang, 'Price ↓', 'Giá ↓')],
            ['time', tr(lang, 'Quickest', 'Nhanh nhất')],
          ].map(([id, label]) =>
            pill(
              label,
              sort === id,
              () => setSort(id),
              id
            )
          )}
        </View>
      </View>

      {/* Danh sach mon an */}
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionText}>
          {tr(lang, 'The menu', 'Thực đơn')}
        </Text>

        <Text style={styles.sectionCount}>
          {shown.length}{' '}
          {tr(lang, 'items', 'món')}
        </Text>
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={shown}
        keyExtractor={(item, index) =>
          String(
            item.apiId ||
            item.localId ||
            item.id ||
            index
          )
        }
        refreshing={loading}
        onRefresh={onRefresh}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Header />}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const category = categories.find(
            (c) =>
              String(c.id) === String(item.categoryId)
          );

          return (
            <DishCard
              dish={item}
              categoryName={category?.name || ''}
              onPress={() => onSelect?.(item)}
              lang={lang}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>

            <Text style={styles.emptyTitle}>
              {tr(
                lang,
                'No dishes found',
                'Chưa tìm thấy món ăn'
              )}
            </Text>

            <Text style={styles.emptyHint}>
              {tr(
                lang,
                'Try another filter or add a new dish.',
                'Thử bộ lọc khác hoặc thêm món mới.'
              )}
            </Text>
          </View>
        }
      />

      {/* Nut them mon */}
      <Pressable
        style={styles.fab}
        onPress={onAdd}
      >
        <Text style={styles.fabText}>
          ＋ {tr(lang, 'Add new dish', 'Thêm món mới')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FB',
  },

  list: {
    paddingHorizontal: 18,
    paddingBottom: 125,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },

  top: {
    paddingTop: 26,
    paddingBottom: 23,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  eyebrow: {
    fontSize: 11,
    color: '#E17951',
    letterSpacing: 1.3,
    fontWeight: '800',
  },

  header: {
    fontWeight: '900',
    fontSize: 30,
    color: '#162737',
    marginTop: 9,
    letterSpacing: -1.1,
  },

  accent: {
    color: '#E17951',
  },

  subheading: {
    fontSize: 13,
    color: '#7C8897',
    marginTop: 6,
  },

  language: {
    padding: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginLeft: 10,
  },

  languageText: {
    fontWeight: '800',
    color: '#15273B',
  },

  hero: {
    borderRadius: 24,
    backgroundColor: '#163348',
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 23,
  },

  heroSmall: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BFD1DB',
    letterSpacing: 1.1,
  },

  heroBig: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 10,
  },

  heroUnit: {
    fontSize: 18,
    fontWeight: '500',
    color: '#F7D3B7',
  },

  heroEmoji: {
    fontSize: 74,
  },

  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },

  sectionText: {
    color: '#172B3F',
    fontSize: 21,
    fontWeight: '900',
  },

  sectionCount: {
    color: '#9BA6B3',
    fontSize: 12,
    fontWeight: '700',
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF1',
    borderRadius: 17,
    marginBottom: 19,
    paddingHorizontal: 16,
  },

  magnify: {
    fontSize: 28,
    color: '#EF8B60',
  },

  search: {
    height: 54,
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#172B3F',
  },

  filterTitle: {
    fontWeight: '800',
    color: '#435363',
    fontSize: 13,
    marginBottom: 10,
    marginTop: 6,
  },

  categoryPills: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },

  pills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    paddingBottom: 8,
  },

  pill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9ED',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 13,
    marginBottom: 6,
  },

  pillSelected: {
    backgroundColor: '#E87951',
    borderColor: '#E87951',
  },

  pillText: {
    color: '#627183',
    fontWeight: '700',
    fontSize: 12,
  },

  pillSelectedText: {
    color: '#FFFFFF',
  },

  filtersBox: {
    marginTop: 14,
    padding: 17,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDF0F4',
    marginBottom: 21,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginVertical: 10,
  },

  priceInput: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E9ECF1',
    padding: 12,
    minWidth: 0,
    fontSize: 12,
  },

  dash: {
    color: '#9EADB8',
  },

  error: {
    color: '#C44343',
    fontSize: 12,
    marginBottom: 8,
  },

  empty: {
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    gap: 9,
    marginBottom: 20,
  },

  emptyTitle: {
    color: '#213348',
    fontSize: 18,
    fontWeight: '800',
  },

  emptyHint: {
    fontSize: 12,
    color: '#8A97A5',
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#E87951',
    borderRadius: 17,
    paddingVertical: 17,
    paddingHorizontal: 22,
    elevation: 5,
    shadowColor: '#E87951',
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
