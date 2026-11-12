import { useState, type ReactNode } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
// The same import a web app writes. Metro resolves it to the package's native entry
// (src/index.native.ts → Button.native.tsx, …); a web bundler gets the web build instead.
import {
  Badge,
  Button,
  Icon,
  InputField,
  ThemeProvider,
  TransactionCard,
  ZakatCalculator,
  formatMoney,
  fontSize,
  fontWeight,
  parseAmount,
  radius,
  spacing,
  useTheme,
  type ThemeName,
} from '@mal/design-system';

export default function App() {
  const system = useColorScheme();
  const [theme, setTheme] = useState<ThemeName>(system === 'dark' ? 'dark' : 'light');

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <Home theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const balance = { minor: 4_825_050, currency: 'AED' };
const nisab = { minor: 2_450_000, currency: 'AED' };

function Home({ theme, onToggleTheme }: { theme: ThemeName; onToggleTheme: () => void }) {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const amountError = parseAmount(amount) === null ? 'Enter an amount like 250.00' : undefined;

  const send = () => {
    setSending(true);
    setTimeout(() => setSending(false), 1500);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text accessibilityRole="header" style={[styles.h1, { color: colors.fg }]}>
              Accounts
            </Text>
            <Button variant="secondary" size="sm" onPress={onToggleTheme}>
              {theme === 'dark' ? 'Light theme' : 'Dark theme'}
            </Button>
          </View>

          {/* App code styles itself with the same tokens the components use. */}
          <View style={[styles.balance, { backgroundColor: colors.brand }]}>
            <Text style={[fontSize.sm, { color: colors['fg-on-brand'], opacity: 0.85 }]}>Current account</Text>
            <Text style={[styles.balanceFigure, { color: colors['fg-on-brand'] }]}>{formatMoney(balance)}</Text>
            <Badge tone="accent" icon={<Icon name="check" size={12} />}>
              Sharia compliant
            </Badge>
          </View>

          <Section title="Send money">
            <InputField
              label="Amount"
              variant="amount"
              currency="AED"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              error={amountError}
              hint="Transfers to Mal accounts are instant."
            />
            <View style={styles.row}>
              <Button leadingIcon={<Icon name="arrow-up-right" size={18} />} loading={sending} onPress={send}>
                Send
              </Button>
              <Button variant="secondary" leadingIcon={<Icon name="arrow-down-left" size={18} />}>
                Request
              </Button>
              <Button variant="tertiary">View all</Button>
            </View>
          </Section>

          <Section title="Recent activity">
            <TransactionCard
              merchant="Talabat"
              amount={{ minor: 6_450, currency: 'AED' }}
              direction="debit"
              category="food"
              date="2026-11-11T19:20:00+04:00"
              onPress={() => Alert.alert('Talabat', 'Transaction details')}
            />
            <TransactionCard
              merchant="DEWA"
              amount={{ minor: 41_230, currency: 'AED' }}
              direction="debit"
              category="bills"
              status="pending"
              description="Oct bill"
              date="2026-11-10T08:00:00+04:00"
            />
            <View style={[styles.list, { borderColor: colors.border }]}>
              <TransactionCard
                variant="compact"
                merchant="Salary · Emaar"
                amount={{ minor: 2_200_000, currency: 'AED' }}
                direction="credit"
                category="salary"
                date="2026-11-01T09:00:00+04:00"
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <TransactionCard
                variant="compact"
                merchant="Emirates"
                amount={{ minor: 185_000, currency: 'AED' }}
                direction="debit"
                category="travel"
                status="failed"
                date="2026-10-28T14:00:00+04:00"
              />
            </View>
          </Section>

          <ZakatCalculator
            nisab={nisab}
            defaultValues={{ cash: '45000', goldSilver: '12000' }}
            onPay={(r) => Alert.alert('Pay Zakat', `Pay ${formatMoney({ minor: r.zakat, currency: r.currency })}?`)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.h2, { color: colors.fg }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing[4], gap: spacing[6], paddingBottom: spacing[16] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h1: { ...fontSize['2xl'], fontWeight: fontWeight.bold },
  h2: { ...fontSize.md, fontWeight: fontWeight.semibold },
  balance: { borderRadius: radius.xl, padding: spacing[5], gap: spacing[2] },
  balanceFigure: { ...fontSize['3xl'], fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  section: { gap: spacing[3] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  list: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth },
});
