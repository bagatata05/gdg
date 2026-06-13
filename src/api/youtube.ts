export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "";

export const fetchRecipeVideo = async (recipeName: string): Promise<string | null> => {
  if (!YOUTUBE_API_KEY) return null;
  try {
    const query = `${recipeName} cooking recipe panlasang pinoy`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      console.error("YouTube API response error:", res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (error) {
    console.error("Failed to fetch YouTube video for recipe:", recipeName, error);
    return null;
  }
};
