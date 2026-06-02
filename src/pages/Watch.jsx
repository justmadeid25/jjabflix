import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTvSeason } from '../api/tmdb';

const SERVERS = [
  {
    name: '서버 1',
    // vidsrc.to — TMDB 기반, HTTPS 안정적
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv:    (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: '서버 2',
    // embed.su — TMDB 기반, 한국 콘텐츠 비교적 양호
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv:    (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: '서버 3',
    // autoembed.co — 경로 방식, TV 시즌-에피소드 하이픈 연결
    movie: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    tv:    (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
  },
  {
    name: '서버 4',
    // 2embed.cc — ? 쿼리 파라미터 올바르게 수정 (기존 &는 버그)
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv:    (id, s, e) => `https://www.2embed.cc/embedtv/${id}?s=${s}&e=${e}`,
  },
  {
    name: '서버 5',
    // vidsrc.me — vidsrc 계열 중 안정적인 미러
    movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv:    (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
];

const Watch = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { addToHistory } = useAuth();
  const [serverIdx, setServerIdx] = useState(0);

  const isTv = mediaType === 'tv';
  const seriesTitle = state?.seriesTitle ?? state?.title ?? '';

  const [currentSeason, setCurrentSeason] = useState(state?.season ?? 1);
  const [currentEpisode, setCurrentEpisode] = useState(state?.episode ?? 1);
  const [episodes, setEpisodes] = useState(state?.episodes ?? []);

  // TV인데 에피소드 목록이 없으면 fetch
  useEffect(() => {
    if (!isTv || episodes.length > 0) return;
    fetchTvSeason(id, currentSeason)
      .then((data) => setEpisodes(data.episodes ?? []))
      .catch(() => {});
  }, [id, isTv, currentSeason]);

  const currentEpisodeInfo = episodes.find((e) => e.episode_number === currentEpisode);

  const displayTitle = isTv
    ? `${seriesTitle}${currentEpisodeInfo ? ` - ${currentEpisodeInfo.name}` : ` S${currentSeason}E${currentEpisode}`}`
    : (state?.title ?? '');

  const server = SERVERS[serverIdx];
  const videoUrl = isTv
    ? server.tv(id, currentSeason, currentEpisode)
    : server.movie(id);

  const isLastEpisode =
    episodes.length > 0 &&
    !episodes.some((e) => e.episode_number > currentEpisode);
  const hasNextEpisode = isTv && !isLastEpisode;

  const handleNextEpisode = () => {
    if (!hasNextEpisode) return;
    setCurrentEpisode((prev) => prev + 1);
  };

  // 시청 기록 저장 (id, mediaType 바뀔 때)
  useEffect(() => {
    if (!id || !mediaType) return;
    const m = state?.movie ?? {};
    addToHistory({
      id: Number(id),
      mediaType,
      media_type: mediaType,
      title: m.title ?? m.name ?? seriesTitle ?? '',
      name: m.name ?? null,
      poster_path: m.poster_path ?? null,
      backdrop_path: m.backdrop_path ?? null,
      genre_ids: m.genre_ids ?? [],
      vote_average: m.vote_average ?? 0,
      release_date: m.release_date ?? null,
      first_air_date: m.first_air_date ?? null,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mediaType]);

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 바 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 20px',
        backgroundColor: 'rgba(0,0,0,0.85)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ← 뒤로가기
        </button>

        {displayTitle && (
          <span style={{ color: '#ccc', fontSize: '15px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
            | {displayTitle}
          </span>
        )}

        {/* 다음 화 버튼 (TV만) */}
        {hasNextEpisode && (
          <button
            onClick={handleNextEpisode}
            style={{
              padding: '5px 14px',
              fontSize: '13px',
              borderRadius: '4px',
              border: '1px solid #e50914',
              cursor: 'pointer',
              backgroundColor: '#e50914',
              color: '#fff',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            다음 화 ▶
          </button>
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
                borderColor: i === serverIdx ? '#e50914' : '#666',
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
