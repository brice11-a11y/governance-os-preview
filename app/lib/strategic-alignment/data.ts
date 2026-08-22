export type Maturity = 'high' | 'medium' | 'low'
export interface CompanyGoal { id: string; name: string; metric: string }
export interface Okr { id: string; name: string; companyGoalId: string }
export interface ValueStream { id: string; name: string; expansion: string; northStar: string; maturity: Maturity }
export interface Art { id: string; name: string; valueStreamId: string }
export interface Theme { id: string; name: string; artId: string; okrId: string; testCount: number }
export type Outcome = 'won' | 'flat' | 'lost'
export interface RelatedTest { id: string; name: string; art: string; surface: string; metric: string; outcome: Outcome; deltaLabel: string; matchReason: string; similarity: number }

export const COMPANY_GOALS: CompanyGoal[] = [
  { id: 'CG1', name: 'Revenue Optimisation', metric: 'Revenue per Session' },
  { id: 'CG2', name: 'Conversion', metric: 'Booking Conversion Rate' },
  { id: 'CG3', name: 'Ancillary Revenue', metric: 'Ancillary Revenue / booking' },
  { id: 'CG4', name: 'Customer Satisfaction', metric: 'NPS' },
]

export const OKRS: Okr[] = [
  { id: 'OKR-ISB-1', name: 'Booking conversion +0.3pp', companyGoalId: 'CG2' },
  { id: 'OKR-ISB-2', name: 'Checkout drop-off −8%', companyGoalId: 'CG1' },
  { id: 'OKR-ANC-1', name: 'Ancillary attach +3pp', companyGoalId: 'CG3' },
  { id: 'OKR-XS-1', name: 'Authenticated booking share +3pp', companyGoalId: 'CG4' },
]

export const VALUE_STREAMS: ValueStream[] = [
  { id: 'ISB', name: 'ISB', expansion: 'Inspiration, Shopping, Booking', northStar: 'Booking Conversion Rate', maturity: 'high' },
  { id: 'ANC', name: 'ANC', expansion: 'Ancillary', northStar: 'Ancillary Take Rate', maturity: 'medium' },
  { id: 'PPL', name: 'PPL', expansion: 'People / Profile & Loyalty', northStar: 'Log-in Share', maturity: 'low' },
  { id: 'CS', name: 'CS', expansion: 'Customer Service / Self-Service', northStar: 'Call Deflection Rate', maturity: 'low' },
  { id: 'TEX', name: 'TEX', expansion: 'Travel Experience', northStar: 'Self Check-in Rate', maturity: 'low' },
  { id: 'PAYMENT', name: 'PAYMENT', expansion: 'Payment', northStar: 'Payment Completion', maturity: 'medium' },
  { id: 'B2B', name: 'B2B', expansion: 'Business — Agency & Corporate', northStar: 'Self-Service Loyalty Bookings + Conversion rate', maturity: 'low' },
]

export const ARTS: Art[] = [
  { id: 'shopping', name: 'Shopping', valueStreamId: 'ISB' },
  { id: 'booking', name: 'Booking', valueStreamId: 'ISB' },
  { id: 'fare-selection', name: 'Fare Selection', valueStreamId: 'ISB' },
  { id: 'seats', name: 'Seats', valueStreamId: 'ANC' },
  { id: 'bags', name: 'Bags', valueStreamId: 'ANC' },
  { id: 'upgrades', name: 'Upgrades', valueStreamId: 'ANC' },
  { id: 'account', name: 'Account', valueStreamId: 'PPL' },
  { id: 'loyalty', name: 'Loyalty', valueStreamId: 'PPL' },
  { id: 'help-center', name: 'Help Center', valueStreamId: 'CS' },
  { id: 'rebooking', name: 'Rebooking', valueStreamId: 'CS' },
  { id: 'check-in', name: 'Check-in', valueStreamId: 'TEX' },
  { id: 'boarding-pass', name: 'Boarding Pass', valueStreamId: 'TEX' },
  { id: 'payment-methods', name: 'Payment Methods', valueStreamId: 'PAYMENT' },
  { id: 'checkout-payment', name: 'Checkout Payment', valueStreamId: 'PAYMENT' },
  { id: 'agency-portal', name: 'Agency Portal', valueStreamId: 'B2B' },
  { id: 'corporate-booking', name: 'Corporate Booking', valueStreamId: 'B2B' },
]

export const THEMES: Theme[] = [
  { id: 'T1', name: 'Reduce payment friction', artId: 'booking', okrId: 'OKR-ISB-2', testCount: 12 },
  { id: 'T2', name: 'Trust & transparency at checkout', artId: 'booking', okrId: 'OKR-ISB-1', testCount: 4 },
  { id: 'T3', name: 'Faster fare comparison', artId: 'shopping', okrId: 'OKR-ISB-2', testCount: 7 },
  { id: 'T4', name: 'Branded fares upsell', artId: 'fare-selection', okrId: 'OKR-ANC-1', testCount: 3 },
  { id: 'T5', name: 'Seat selection relevance', artId: 'seats', okrId: 'OKR-ANC-1', testCount: 5 },
  { id: 'T6', name: 'Bag bundle nudges', artId: 'bags', okrId: 'OKR-ANC-1', testCount: 0 },
]

/** Core KPIs per value stream, from the Value Stream Core KPI Register (1 Jun 2026).
 *  Each VS's North Star (VALUE_STREAMS[].northStar) is the first entry of its list. */
export const KPI_REGISTER: Record<string, string[]> = {
  ISB: ['Booking Conversion Rate', 'Booking Entry Rate', 'Qualified Booking Entry Rate', 'Average Order Value', 'Offer Based Increment'],
  ANC: ['Ancillary Take Rate', 'ANC Total Revenue (Sold/Flown)', 'Ancillary Revenue per Channel / Pax', 'Click-through Rate for 3rd party ANC'],
  PPL: ['Log-in Share', 'Reach', 'Enrollments', 'Hallway Funnels Completion', 'Elite Cash Awards', 'Upgrade Awards & eVouchers'],
  CS: ['Call Deflection Rate', 'E2E Claim Automation', 'Manual Handling Time Reduction'],
  TEX: ['Self Check-in Rate', 'Booked a hotel room via self-service', 'Use Damaged Bag Service', 'Use Delayed Bag Service', 'Use Trip Assistant', 'Traveler ID Live Activities', 'Use Meal PreSelection'],
  PAYMENT: ['Payment Completion', 'Payment Authorisation Approval', 'Payment Chargeback / Fraud', 'Payment Method Share'],
  B2B: ['Self-Service Loyalty Bookings + Conversion rate', 'AirGroup4B traffic and portal usage', 'Corporate Fund Usage', 'Package Revenue and Points redemption', 'CRM Adoption rate'],
}

export const kpisFor = (valueStreamId?: string): string[] => (valueStreamId ? KPI_REGISTER[valueStreamId] ?? [] : [])

export const RELATED_TESTS: RelatedTest[] = [
  { id: 'RT1', name: 'Security badges on payment page', art: 'Booking', surface: 'payment', metric: 'Checkout Completion', outcome: 'won', deltaLabel: '+1.2%', matchReason: 'same surface + metric', similarity: 0.91 },
  { id: 'RT2', name: 'Reassurance microcopy near pay CTA', art: 'Booking', surface: 'payment', metric: 'Checkout Completion', outcome: 'flat', deltaLabel: 'no effect', matchReason: 'same hypothesis family', similarity: 0.84 },
  { id: 'RT3', name: 'Trust seals on fare selection', art: 'Fare Selection', surface: 'fare select', metric: 'Fare upsell', outcome: 'lost', deltaLabel: '−0.8%', matchReason: 'same concept, different surface', similarity: 0.71 },
]

export const getValueStream = (id?: string) => VALUE_STREAMS.find((v) => v.id === id)
export const getArt = (id?: string) => ARTS.find((a) => a.id === id)
export const getTheme = (id?: string) => THEMES.find((t) => t.id === id)
export const getOkr = (id?: string) => OKRS.find((o) => o.id === id)
export const getCompanyGoal = (id?: string) => COMPANY_GOALS.find((c) => c.id === id)
