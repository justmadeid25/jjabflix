import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SERVERS = [
  {
    name: '서버 1',
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv:    (id) => `https://www.2embed.cc/embedtv/${id}&s=1&e=1`,
  },
  {
    name: '서버 2',
    movie: (id) => `https://vidsrc.net/embed/movie?tmdb=${id}`,
    tv:    (id) => `https://vidsrc.net/embed/tv?tmdb=${id}&season=1&episode=1`,
  },
  {
    name: '서버 3',
    movie: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    tv:    (id) => `https://autoembed.co/tv/tmdb/${id}-1-1`,
  },
  {
    name: '서버 4',
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv:    (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=1&e=1`,
  },
  {
    name: '서버 5',
    movie: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    tv:    (id) => `https://vidsrc.xyz/embed/tv/${id}/1/1`,
  },
];

const Watch = () => {
  const { mediaType, id } = useParams();
  const navigate          = useNavigate();
  const { state }         = useLocation();
  const { addToHistory }  = useAuth();
  const [serverIdx, setServerIdx] = useState(0);

  const title    = state?.title ?? '';
  const isTv     = mediaType === 'tv';
  const server   = SERVERS[serverIdx];
  const videoUrl = isTv ? server.tv(id) : server.movie(id);

  // 페이지 진입 시 시청 기록 저장
  useEffect(() => {
    if (!id || !mediaType) return
    const m = state?.movie ?? {}
    addToHistory({
      id:            Number(id),
      mediaType,
      media_type:    mediaType,
      title:         m.title  ?? m.name ?? title ?? '',
      name:          m.name   ?? null,
      poster_path:   m.poster_path   ?? null,
      backdrop_path: m.backdrop_path ?? null,
      genre_ids:     m.genre_ids     ?? [],
      vote_average:  m.vote_average  ?? 0,
      release_date:  m.release_date  ?? null,
      first_air_date:m.first_air_date ?? null,
    })
  // 라우트(id/mediaType)가 바뀔 때만 저장
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mediaType])

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', backgroundColor: 'rgba(0,0,0,0.85)', flexShrink: 0, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ← 뒤로가기
        </button>

        {title && (
          <span style={{ color: '#ccc', fontSize: '15px', fontWeight: 600 }}>
            | {title}
          </span>
        )}

        {/* 서버 전환 버튼 */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {SERVERS.map((s, i) => (
            <button
              key={i}
              onClick={() => setServerIdx(i)}
              style={{
                padding: '4px 12px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid',
                cursor: 'pointer',
                backgroundColor: i === serverIdx ? '#e50914' : 'transparent',
                borderColor:     i === serverIdx ? '#e50914' : '#666',
                color: '#fff',
                fontWeight: i === serverIdx ? 700 : 400,
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* iframe 플레이어 */}
      <iframe
        key={videoUrl}
        src={videoUrl}
        style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
        allowFullScreen
        referrerPolicy="no-referrer"
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};

export default Watch;
