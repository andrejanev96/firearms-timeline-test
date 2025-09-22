export function getShareUrls(params: {
  score: number;
  total: number;
  tierName: string;
  url?: string;
}) {
  const shareUrl = encodeURIComponent(params.url ?? window.location.href);
  const twitterText = `I just scored ${params.score}/${params.total} on the American Firearms Timeline Challenge and earned the rank of ${params.tierName}! Can you beat my score?`;
  const redditTitle = `I scored ${params.score}/${params.total} on the American Firearms Timeline Challenge and earned ${params.tierName}!`;
  return {
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    reddit: `https://www.reddit.com/submit?url=${shareUrl}&title=${encodeURIComponent(redditTitle)}`,
  };
}

export function openShareWindow(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

