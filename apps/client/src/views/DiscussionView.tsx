import { useEffect, useState } from "react";
import {
  type CommunityPost,
  type TrendingTopic,
  fetchCommunityPosts,
  fetchTrendingTopics,
  createCommunityPost,
} from "../lib/community";
import { useAuthStore } from "../store";

export const DiscussionView = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "trending" | "hot">(
    "all"
  );
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [fetchedPosts, fetchedTopics] = await Promise.all([
          fetchCommunityPosts(50),
          fetchTrendingTopics(10),
        ]);
        setPosts(fetchedPosts);
        setTopics(fetchedTopics);
      } catch (e: any) {
        setError(e.message ?? "Erreur lors du chargement de la communauté");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    if (!isAuthenticated || !token) {
      setError("Connectez-vous pour publier un message.");
      return;
    }

    (async () => {
      try {
        setError(null);
        const post = await createCommunityPost(
          { content: newPostContent.trim() },
          token
        );
        setPosts((prev) => [
          {
            ...post,
            author: post.author ?? {
              id: post.userId,
              username: "Vous",
              avatarUrl: null,
            },
          },
          ...prev,
        ]);
        setNewPostContent("");
      } catch (e: any) {
        setError(e.message ?? "Erreur lors de la création du post");
      }
    })();
  };

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-10">
        {/* Colonne principale : feed communauté */}
        <div className="flex-1 space-y-8">
          {/* Titre + sous-titre */}
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white tracking-wide">
              COMMUNAUTÉ{" "}
              <span className="text-[#9747FF]">CINHETIC</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Partagez, discutez et découvrez avec des passions de cinéma
            </p>
          </header>

          {/* Filtres (Tous / Tendances / Hot) */}
          <div className="flex gap-4 mt-4">
            {[
              { id: "all", label: "Tous" },
              { id: "trending", label: "Tendances" },
              { id: "hot", label: "Hot" },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveFilter(tab.id as "all" | "trending" | "hot")
                  }
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-[#9747FF] text-white shadow-[0_0_20px_rgba(151,71,255,0.6)]"
                      : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Zone de création de post */}
          <section className="bg-gray-900 rounded-2xl px-6 py-4 flex flex-col gap-4">
            {error && (
              <div className="text-xs text-red-400 bg-red-900/40 border border-red-500/60 rounded-lg px-3 py-2 mb-1">
                {error}
              </div>
            )}
            <form onSubmit={handlePublish} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-700" />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Partagez vos avis avec la communauté..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-black/40 border border-gray-700 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  <span className="w-4 h-4 rounded-full border border-gray-400" />
                  Image
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-sm font-semibold bg-[#9747FF] text-white hover:bg-[#8a3ae6] transition-colors shadow-[0_0_16px_rgba(151,71,255,0.6)]"
                >
                  Publier
                </button>
              </div>
            </form>
          </section>

          {/* Feed des posts */}
          <section className="space-y-4">
            {loading ? (
              <div className="text-gray-400 text-sm">Chargement...</div>
            ) : posts.length === 0 ? (
              <div className="text-gray-500 text-sm">
                Aucun message pour le moment. Soyez le premier à partager un avis !
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-gray-900 rounded-2xl px-6 py-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {post.author?.username ?? "Utilisateur"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 space-y-1">
                    <h2 className="text-base font-semibold text-white">
                      {post.filmTitle ?? post.content}
                    </h2>
                    <p className="text-sm text-gray-300">
                      {post.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                      <span>{post.commentCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                      <span>{post.viewCount}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>

        {/* Colonne droite : tendances + invitation amis */}
        <aside className="w-full lg:w-80 space-y-6">
          <section className="bg-gray-900 rounded-2xl px-5 py-4 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Sujets Tendances</span>
            </h2>
            <div className="space-y-2">
              {topics.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Pas encore de sujets tendances.
                </p>
              ) : (
                topics.map((topic) => (
                  <div
                    key={topic.name}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-gray-900 via-gray-900 to-transparent border border-[#9747FF]/30 hover:border-[#9747FF]/60 transition-colors"
                  >
                    <span className="text-xs text-white">
                      #{topic.name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {topic.postCount} post{topic.postCount > 1 ? "s" : ""}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-gradient-to-b from-[#9747FF] to-[#7b35d9] rounded-2xl px-6 py-6 text-center space-y-3 shadow-[0_0_40px_rgba(151,71,255,0.6)]">
            <h2 className="text-base font-display font-semibold text-white">
              Invitez vos amis
            </h2>
            <p className="text-xs text-white/80">
              Partagez votre passion cinéma et gagnez des récompenses exclusives.
            </p>
            <button className="mt-2 px-6 py-2 rounded-full text-xs font-semibold bg-white text-[#9747FF] hover:bg-gray-100 transition-colors">
              Invitez maintenant
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
};

