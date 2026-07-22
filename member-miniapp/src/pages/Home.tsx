import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper } from 'antd-mobile'
import {
  MapPin, Search, Bell, ChevronRight, Zap, Calendar, Store,
  ParkingCircle, Coins, QrCode, Crown, Headphones, Car, Gift, UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { Toast } from 'antd-mobile'
import request from '../services/request'

interface HomeData {
  notices: string[]
  banners: { id: number; image: string; title: string; link: string }[]
  services: { id: number; name: string; icon: string; link: string }[]
  events: { date: string; title: string; location: string }[]
  merchants: { title: string; subtitle: string; tag: string; image: string }[]
  categories: { name: string; count: number }[]
  flashSale: {
    title: string
    subtitle: string
    endTime: string
    goods: { name: string; price: number; originalPrice: number; image: string }[]
  }
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  停车缴费: ParkingCircle,
  快速金币: Coins,
  金币码: QrCode,
  会员权益: Crown,
  联系客服: Headphones,
  自助寻车: Search,
  我要打车: Car,
  我要充电: Zap,
  金币兑换: Gift,
  餐饮导览: UtensilsCrossed,
}

const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #2C2C44 0%, #C9A86A 120%)',
  'linear-gradient(135deg, #1A1A2E 0%, #8A6E3E 130%)',
  'linear-gradient(135deg, #232347 0%, #E0C896 140%)',
]

const ROUTE_MAP: Record<string, string> = {
  '/parking': '/parking',
  '/points': '/points',
  '/member': '/member',
  '/mall': '/mall',
  '/restaurant': '/restaurant',
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function Home() {
  const navigate = useNavigate()
  const [data, setData] = useState<HomeData | null>(null)
  const [noticeIdx, setNoticeIdx] = useState(0)
  const [countdown, setCountdown] = useState({ h: '00', m: '00', s: '00' })
  const noticeTimer = useRef<number | null>(null)

  useEffect(() => {
    request
      .get<HomeData>('/capp/home')
      .then((d) => setData(d as HomeData))
      .catch((e) => Toast.show({ content: (e as Error).message, icon: 'fail' }))
  }, [])

  useEffect(() => {
    if (!data?.notices?.length) return
    noticeTimer.current = window.setInterval(() => {
      setNoticeIdx((i) => (i + 1) % data.notices.length)
    }, 3000)
    return () => {
      if (noticeTimer.current) window.clearInterval(noticeTimer.current)
    }
  }, [data?.notices])

  useEffect(() => {
    if (!data?.flashSale?.endTime) return
    const end = new Date(data.flashSale.endTime.replace(' ', 'T')).getTime()
    const tick = () => {
      const diff = Math.max(0, end - Date.now())
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown({ h: pad(h), m: pad(m), s: pad(s) })
    }
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
  }, [data?.flashSale?.endTime])

  const goService = (link: string, name: string) => {
    const route = ROUTE_MAP[link]
    if (route) {
      navigate(route)
    } else {
      Toast.show({ content: `${name}·敬请期待` })
    }
  }

  return (
    <div className="page home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-loc">
          <MapPin size={15} />
          <span>恒伟商业广场</span>
          <ChevronRight size={13} className="home-loc-arrow" />
        </div>
        <button type="button" className="home-search" onClick={() => Toast.show({ content: '搜索功能·敬请期待' })} aria-label="搜索">
          <Search size={15} className="home-search-icon" />
          <span className="home-search-ph">搜索品牌 / 商品 / 活动</span>
        </button>
      </header>

      {/* Notice */}
      {data?.notices?.length ? (
        <div className="home-notice">
          <span className="home-notice-badge">
            <Bell size={12} />
            <span>公告</span>
          </span>
          <div className="home-notice-track">
            <span key={noticeIdx} className="home-notice-text">
              {data.notices[noticeIdx]}
            </span>
          </div>
        </div>
      ) : null}

      <div className="home-body">
        {/* Banner */}
        <section className="section home-banner-wrap">
          {data ? (
            <Swiper loop autoplay autoplayInterval={4000} className="home-swiper">
              {data.banners.map((b, i) => (
                <Swiper.Item key={b.id}>
                  <div
                    className="home-banner"
                    style={{ background: BANNER_GRADIENTS[i % BANNER_GRADIENTS.length] }}
                  >
                    <div className="home-banner-inner">
                      <span className="home-banner-eyebrow">PROMOTION</span>
                      <h2 className="home-banner-title">{b.title}</h2>
                      <span className="home-banner-cta">
                        立即查看 <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </Swiper.Item>
              ))}
            </Swiper>
          ) : (
            <div className="skeleton home-banner" />
          )}
        </section>

        {/* Services grid */}
        <section className="section card home-services">
          {data
            ? data.services.map((s) => {
                const Icon = SERVICE_ICONS[s.name] || Gift
                return (
                  <button
                    key={s.id}
                    className="home-service"
                    onClick={() => goService(s.link, s.name)}
                  >
                    <span className="home-service-icon">
                      <Icon size={22} strokeWidth={1.7} />
                    </span>
                    <span className="home-service-name">{s.name}</span>
                  </button>
                )
              })
            : Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="home-service">
                  <span className="skeleton home-service-icon" />
                  <span className="skeleton" style={{ width: 36, height: 10, marginTop: 8 }} />
                </div>
              ))}
        </section>

        {/* Flash sale */}
        {data?.flashSale ? (
          <section className="section home-flash">
            <div className="home-flash-head">
              <div className="home-flash-title">
                <Zap size={18} className="home-flash-zap" />
                <span>{data.flashSale.title}</span>
                <span className="home-flash-sub">{data.flashSale.subtitle}</span>
              </div>
              <div className="home-flash-cd">
                <span>{countdown.h}</span>
                <i>:</i>
                <span>{countdown.m}</span>
                <i>:</i>
                <span>{countdown.s}</span>
              </div>
            </div>
            <div className="home-flash-list no-scrollbar">
              {data.flashSale.goods.map((g, i) => (
                <div key={i} className="home-flash-item">
                  <div className="home-flash-img">
                    <span>{g.name.slice(0, 1)}</span>
                  </div>
                  <p className="home-flash-name">{g.name}</p>
                  <div className="home-flash-price">
                    <span className="cur">{new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(Number(g.price))}</span>
                    <span className="orig">{new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(Number(g.originalPrice))}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Events */}
        {data?.events?.length ? (
          <section className="section card home-events">
            <div className="section-head">
              <div className="section-title">
                <span className="accent-bar" />
                <Calendar size={17} />
                <span>精彩活动</span>
              </div>
              <span className="section-more">
                全部 <ChevronRight size={13} />
              </span>
            </div>
            <div className="home-events-list">
              {data.events.slice(0, 3).map((e, i) => (
                <div key={i} className="home-event">
                  <div className="home-event-date">
                    <span className="d">{e.date}</span>
                  </div>
                  <div className="home-event-info">
                    <p className="home-event-title">{e.title}</p>
                    <p className="home-event-loc">
                      <MapPin size={11} /> {e.location}
                    </p>
                  </div>
                  <ChevronRight size={15} className="home-event-arrow" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Merchants */}
        {data?.merchants?.length ? (
          <section className="section">
            <div className="section-head">
              <div className="section-title">
                <span className="accent-bar" />
                <Store size={17} />
                <span>新店速递</span>
              </div>
            </div>
            <div className="home-merchants">
              {data.merchants.map((m, i) => (
                <div key={i} className="home-merchant card">
                  <div
                    className="home-merchant-img"
                    style={{ background: BANNER_GRADIENTS[i % BANNER_GRADIENTS.length] }}
                  >
                    <Store size={26} />
                    <span className="home-merchant-tag">{m.tag}</span>
                  </div>
                  <div className="home-merchant-info">
                    <p className="home-merchant-title">{m.title}</p>
                    <p className="home-merchant-sub">{m.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Categories */}
        {data?.categories?.length ? (
          <section className="section card home-cats">
            <div className="section-head" style={{ paddingLeft: 14, paddingRight: 14 }}>
              <div className="section-title">
                <span className="accent-bar" />
                <span>逛分类</span>
              </div>
            </div>
            <div className="home-cats-grid">
              {data.categories.map((c, i) => (
                <button
                  key={i}
                  className="home-cat"
                  onClick={() => Toast.show({ content: `${c.name}·敬请期待` })}
                >
                  <span className="home-cat-name">{c.name}</span>
                  <span className="home-cat-count">{c.count} 家品牌</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
