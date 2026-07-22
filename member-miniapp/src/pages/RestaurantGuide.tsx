import { useState, useEffect } from 'react'
import { UtensilsCrossed, MapPin } from 'lucide-react'
import { Toast } from 'antd-mobile'
import request from '../services/request'

interface Restaurant {
  id: number
  name: string
  cuisine: string
  floor: string
  avgCost: number
  tag: string
  image: string
}

const TAG_CLS: Record<string, string> = {
  热门: 'tag-danger',
  推荐: 'tag-gold',
  亲子: 'tag-info',
  网红: 'tag-danger',
  便捷: 'tag-ghost',
  新店: 'tag-success',
}

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #2C2C44, #C9A86A)',
  'linear-gradient(135deg, #1A1A2E, #8A6E3E)',
  'linear-gradient(135deg, #4A1A22, #E0C896)',
  'linear-gradient(135deg, #232347, #C9A86A)',
]

export default function RestaurantGuide() {
  const [list, setList] = useState<Restaurant[]>([])

  useEffect(() => {
    request
      .get<Restaurant[]>('/capp/restaurant-guide')
      .then((d) => setList(d as Restaurant[]))
      .catch((e) => Toast.show({ content: (e as Error).message, icon: 'fail' }))
  }, [])

  return (
    <div className="page page--no-tab restaurant-page">
      <div className="restaurant-intro">
        <UtensilsCrossed size={18} />
        <span>甄选 {list.length || '–'} 家品质餐厅，满足您的味蕾</span>
      </div>

      <div className="restaurant-list">
        {list.length ? (
          list.map((r, i) => (
            <div key={r.id} className="card restaurant-card">
              <div
                className="restaurant-cover"
                style={{ background: COVER_GRADIENTS[i % COVER_GRADIENTS.length] }}
              >
                <UtensilsCrossed size={28} color="rgba(255,255,255,0.85)" />
                {r.tag ? (
                  <span className={`tag ${TAG_CLS[r.tag] || 'tag-gold'} restaurant-tag`}>
                    {r.tag}
                  </span>
                ) : null}
              </div>
              <div className="restaurant-info">
                <div className="restaurant-info-top">
                  <h3 className="restaurant-name">{r.name}</h3>
                  <span className="restaurant-cost">¥{r.avgCost}/人</span>
                </div>
                <div className="restaurant-meta">
                  <span className="restaurant-cuisine">{r.cuisine}</span>
                  <span className="restaurant-dot" />
                  <span className="restaurant-floor">
                    <MapPin size={12} /> {r.floor}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card restaurant-card">
              <span className="skeleton restaurant-cover" />
              <div className="restaurant-info">
                <span className="skeleton" style={{ width: '40%', height: 16 }} />
                <span className="skeleton" style={{ width: '60%', height: 12, marginTop: 10 }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
