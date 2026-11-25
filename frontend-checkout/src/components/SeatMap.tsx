"use client";

import { useState } from "react";
import mockSeats from "../data/mockSeats.json";
import { CATEGORY_NAMES, formatPrice, MAX_SEATS, type Seat, type SeatCategory } from "../types/seat";
import SeatButton from "./SeatButton";
import SeatLegend from "./SeatLegend";
import BookingSummary from "./BookingSummary";
import styles from "./SeatMap.module.css";

const seats = mockSeats as Seat[];
const tiers = (["VIP", "PT", "G", "MAIN"] as const).map(category => ({
  category, seats: seats.filter(seat => seat.category === category),
}));
const rows = Array.from("ABCDEFGHIJ");
const hall = tiers[3].seats;

export default function SeatMap() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [motion, setMotion] = useState(true);
  const available = seats.filter(seat => seat.status === "AVAILABLE").length;
  const selected = selectedIds.flatMap(id => seats.find(seat => seat.id === id) ?? []);

  function toggle(id: string) {
    const seat = seats.find(s => s.id === id);
    if (!seat || seat.status !== "AVAILABLE") return;
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(value => value !== id));
      setNotice("");
    } else if (selectedIds.length >= MAX_SEATS) {
      setNotice(`You can select up to ${MAX_SEATS} seats. Remove one to select another.`);
    } else {
      setSelectedIds(prev => prev.length < MAX_SEATS && !prev.includes(id) ? [...prev, id] : prev);
      setNotice("");
    }
  }

  function renderSeat(seat: Seat) {
    return <SeatButton key={seat.id} seat={seat} selected={selectedIds.includes(seat.id)} onToggle={toggle} />;
  }

  function hallSide(first: number, last: number) {
    return <div className={styles.hallBlock}>
      <div className={styles.hallRow}><span />{Array.from({length: 10}, (_, i) => <span className={styles.number} key={i}>{first + i}</span>)}</div>
      {rows.map(row => <div key={row} className={styles.hallRow}>
        <span className={styles.rowLabel}>{row}</span>
        {hall.filter(seat => seat.row === row && seat.number >= first && seat.number <= last).map(renderSeat)}
      </div>)}
    </div>;
  }

  return <main className={`${styles.shell} ${!motion ? styles.paused : ""}`}>
    <div className={styles.backdrop} aria-hidden="true"><i className={styles.auroraOne}/><i className={styles.auroraTwo}/><i className={styles.auroraThree}/><i className={styles.gridGlow}/><i className={styles.beam}/><i className={styles.orbit}/></div>
    <div className={styles.inner}>
      <div className={styles.brandBar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">C</span>
          <div><div className={styles.brandName}>Community 360</div><div className={styles.brandSub}>EVENT CREATION</div></div>
        </div>
        <div className={styles.headerActions}><span className={styles.brandContext}>Attendee experience</span><button type="button" className={styles.motionButton} aria-pressed={!motion} onClick={() => setMotion(v => !v)}>{motion ? "Pause motion" : "Resume motion"}</button></div>
      </div>
      <header className={styles.header}>
        <div className={styles.heroCopy}><div className={styles.heroPill}><span/> YOUR NEXT EXPERIENCE</div><h1>Great moments.<br/><em>Better seats.</em></h1><p>Choose your spot, explore the venue and make the experience yours.</p><div className={styles.heroActions}><a href="#venue-layout" className={styles.heroCta}>Explore seats <span aria-hidden="true">↓</span></a><span className={styles.demoTag}>DEMO · SAMPLE DATA</span></div></div>
        <div className={styles.heroArt} aria-hidden="true"><div className={styles.ring}/><div className={styles.ringInner}/><div className={styles.ticket}><div className={styles.ticketTop}><span>COMMUNITY 360</span><span>EVENT PASS</span></div><div className={styles.ticketTitle}>Your next<br/>experience.</div><div className={styles.ticketBottom}><span>DISCOVER · CONNECT</span><i className={styles.barcode}/></div></div><div className={styles.floatingStat}><span className={styles.statIcon}>✦</span><div><strong>{available} seats</strong><small>Available in preview</small></div></div><div className={styles.floatingCapacity}><span>VENUE CAPACITY</span><strong>260</strong></div></div>
      </header>
      <div className={styles.prices}>
        {tiers.map(({category, seats: group}) => <div key={category} className={styles.priceCard}>
          <span className={`${styles.tierDot} ${styles[category.toLowerCase()]}`} aria-hidden="true" />
          <div><strong>{CATEGORY_NAMES[category as SeatCategory]}</strong><small>{group.length} seats</small></div>
          <strong>{formatPrice(group[0]?.price ?? 0)}</strong>
        </div>)}
      </div>
      <div className={styles.content}>
        <section id="venue-layout" className={styles.mapPanel} aria-label="Venue seat map">
          <div className={styles.mapHeader}><div><h2>Venue layout</h2><p>{seats.length} seats · 4 categories</p></div><span>{available} available (demo)</span></div>
          <SeatLegend />
          <p className={styles.scrollHint}>Scroll horizontally on smaller screens to see the full layout.</p>
          <div className={styles.mapScroll} tabIndex={0} role="region" aria-label="Scrollable seating plan">
            <div className={styles.mapCanvas}>
              <div className={styles.stage}>STAGE</div>
              {tiers.slice(0, 3).map(({category, seats: group}) => <div className={styles.tier} key={category}>
                <div className={styles.tierLabel}>{CATEGORY_NAMES[category]} · {formatPrice(group[0].price)}</div>
                <div className={styles.tierRow}>{group.map(renderSeat)}</div>
              </div>)}
              <div className={styles.hallTitle}>MAIN HALL · {formatPrice(hall[0].price)}</div>
              <div className={styles.hall}>
                {hallSide(1, 10)}
                <div className={styles.aisle}><span>CENTRE AISLE</span></div>
                {hallSide(11, 20)}
              </div>
            </div>
          </div>
          <p className={styles.notice} role="status">{notice || (selectedIds.length === MAX_SEATS ? "Maximum 6 seats selected." : `Select up to ${MAX_SEATS} seats per booking.`)}</p>
        </section>
        <BookingSummary seats={selected} onRemove={toggle} onClear={() => { setSelectedIds([]); setNotice(""); }} />
      </div>
      <footer className={styles.footer}>Community 360 · Seat map preview · Live API integration pending</footer>
    </div>
  </main>;
}
