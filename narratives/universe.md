# MERLIN — Narratives (draft for Prem's ratification)
Status: DRAFT. Edit freely — names, numbers, tone. Once ratified, this file moves to
~/Merlin/narratives/universe.md and Sonnet treats it as content, not a suggestion.

## World

Merlin is the AI intelligence layer above **Solent Markets**, a fictional EU-regulated
venue for tokenized real-world assets — bonds, real estate, commodities and funds
issued as digital securities. Merlin is not another data source, dashboard or report: it is the reasoning layer above the venue's
operational systems (issuance, custody, settlement), connecting research, market
activity, compliance and risk into one conversational surface. The underlying systems
remain the source of truth; Merlin is the interface through which they become
intelligence. Every investigation follows the same loop — plan, search, retrieve, correlate,
synthesize, verify — surfacing confidence and recommending the next action. Merlin
never predicts; it assembles evidence, and every recommendation carries its
provenance, its confidence — including what remains unverified — and the data used
to reach it. Desk users are analysts and portfolio managers: they ask questions
in natural language, watch the agent reason across the venue's systems, and act on
what it assembles. The register is professional and calm: money, risk, and regulation
— confidence earned by showing work, never hype.

## Source systems (cited in thinking trails — reuse these names, never invent new ones)

- **MarketTape** — real-time price, volume, and order-flow feed for all listed assets
- **IssuerRegistry** — issuer filings, prospectuses, KYC/audit status
- **LedgerWatch** — on-chain analytics: wallet clusters, transfer patterns, settlement events
- **CompliancePulse** — regulatory watchlists, jurisdiction rules, sanction screens
- **CustodyGrid** — custody balances, settlement confirmations, failed-delivery log
- **RiskLens** — internal risk models: volatility, concentration, counterparty scores
- **PortfolioAtlas** — positions, mandates, exposures, performance, historical decisions

## Entities (recur across scenes — same names, same facts, everywhere)

- **NordBond 2029** — tokenized covered bond, Norwegian issuer Fjellbank; 5.8% yield,
  AA-, €140M outstanding; the desk's benchmark "safe" asset
- **Aldergate Estates** — tokenized Berlin commercial real-estate portfolio; 7.2% yield,
  €62M, quarterly distributions; audit renewal pending in IssuerRegistry
- **Helios Yield Fund** — tokenized diversified credit fund; 9.1% yield, higher volatility,
  RiskLens score 61/100; largest retail-held asset on the venue
- **Vantara Metals** — tokenized copper-royalty note; 6.4% yield, thin liquidity,
  correlated to commodities not credit — the diversifier
- **Kestrel Holdings** — Cyprus-registered counterparty; accumulated 11% of NordBond 2029
  float across 14 wallet clusters in six weeks; no adverse filings — yet
- **Solent Custody** — the venue's custodian; two failed settlements logged this month,
  both involving Kestrel-linked wallets
- **Mira Voss** — Head of Issuance at Fjellbank; quoted in filings, appears in dossiers

## Scene 1 — Discovery & refine (`asset-discovery`) · module: DISCOVER

**Question:** "Show me tokenized assets yielding above 6% suitable for a conservative
portfolio."
**Data shows:** a ranked view of Aldergate (7.2%), Vantara (6.4%), Helios (9.1%) with
yield, risk score, liquidity and jurisdiction; NordBond shown just below threshold at
5.8% as the reference point; 90-day yield-vs-volatility series for each.
**Agent concludes:** Helios's yield is real but its RiskLens 61 and retail concentration
sit outside the conservative mandate (mandate terms cited from PortfolioAtlas); Aldergate fits best pending its audit renewal;
flags Vantara as the diversifier. Confidence moderate on Aldergate (audit pending).
**Refine step (second utterance, same scene family):** "Only EU-regulated, minimum
€50M outstanding, and show me distribution history." → interface rearranges: Vantara
drops (jurisdiction), Aldergate and Helios remain with distribution tables; trail runs
a short second pass citing CompliancePulse and IssuerRegistry.

## Scene 2 — Issuer dossier (`issuer-dossier`) · module: RESEARCH

**Question:** "Give me the full picture on Aldergate Estates before I commit."
**Data shows:** entity dossier — issuer attributes, €62M outstanding, distribution
record (8 consecutive quarters paid), audit status *renewal pending, 12 days*, top
holder concentration, custody position at Solent; relationship map linking Aldergate →
auditor → Solent Custody → top counterparties.
**Agent concludes:** fundamentals sound and distributions unbroken; the single open
risk is the pending audit — recommends sizing the position but gating settlement on
audit confirmation. Confidence high on history, explicitly lower on the forward view
until IssuerRegistry updates.

## Scene 3 — Anomaly investigation (`settlement-anomaly`) · module: INVESTIGATE

**Question:** "Why did two NordBond settlements fail this week?"
**Data shows:** CustodyGrid failed-delivery log; LedgerWatch cluster map revealing the
14 Kestrel-linked wallets and the six-week accumulation to 11% of float; MarketTape
showing volume spikes preceding both failures; CompliancePulse returning Kestrel clean
on sanctions but unrated on counterparty risk.
**Agent concludes:** failures trace to Kestrel-cluster wallets settling faster than
custody confirmation cycles — pattern consistent with position-building ahead of an
expected yield event, not fraud; recommends a counterparty review and a settlement
hold on the cluster. Confidence: high on the wallet attribution, moderate on the
motive. This is the demo's dramatic beat — the graph lights up.

## Connective tissue (why it feels like one platform)

NordBond is the reference asset in Scene 1 and the subject of Scene 3. Solent Custody
appears in the Aldergate dossier and owns the failed settlements. Kestrel, invisible
in Scene 1's retail view, is the answer to Scene 3's question. An audience that saw
all three scenes has met one world from three angles — and the Phase 9 MCP push
becomes the MONITOR module's demo beat: an alert-driven scene arriving unprompted,
about entities they already know.

## Scene 4 — Monitor alert (`audit-status-alert`) · module: MONITOR
**PHASE 9 PUSH CONTENT — NOT a Phase 2 fixture. Do not build with the three above.**
Unprompted, Merlin surfaces an alert: Aldergate's audit status changed in
IssuerRegistry (renewal confirmed — or lapsed; decide at Phase 9 for demo drama).
It correlates the update with MarketTape activity, identifies exposed positions via
PortfolioAtlas, restates the risk from the Scene 2 dossier, and recommends watchlist
or settlement actions — with evidence, confidence, and a link back to the dossier.
The audience has already met every entity in this alert; that is the point.

## Product vision (context only — NOT build scope)
Five modules: Discover (find opportunities) · Research (understand issuers) ·
Monitor (detect change) · Investigate (explain anomalies) · Portfolio (apply
intelligence). The scenes demonstrate Discover, Research,
Investigate; the Phase 9 push demonstrates Monitor; Portfolio is future content.
Modules are scene families + intents, not architecture — expansion adds content,
never engine changes. Further vision, out of prototype scope: triggering downstream
workflows (settlement review, compliance escalation) from recommendations, and
persistent cross-session investigation memory.
