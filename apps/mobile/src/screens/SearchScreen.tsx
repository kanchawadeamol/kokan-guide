import { searchListings } from '@konkan/sample-data';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ListingCard } from '../components/listing';
import { useI18n } from '../i18n/context';
import { format } from '../i18n/messages';
import { SampleBanner, TextField } from '../ui/controls';
import { useSharedStyles } from '../ui/styles';

export function SearchScreen() {
  const { t } = useI18n();
  const { styles } = useSharedStyles();
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const results = trimmed ? searchListings(trimmed) : [];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TextField
        label={t.searchLabel}
        value={query}
        onChangeText={setQuery}
        placeholder={t.searchPlaceholder}
        testID="search-input"
      />
      <SampleBanner />
      {/* Live region: the result count is announced while typing. */}
      <Text accessibilityLiveRegion="polite" style={styles.muted} testID="search-summary">
        {!trimmed
          ? t.searchPrompt
          : results.length === 0
            ? format(t.noResults, { query: trimmed })
            : format(t.resultsCount, { count: results.length })}
      </Text>
      <View style={styles.list}>
        {results.map((listing) => (
          <ListingCard key={listing.slug} listing={listing} />
        ))}
      </View>
    </ScrollView>
  );
}
