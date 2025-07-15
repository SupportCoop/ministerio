const useAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await albumService.getAlbums();
      setAlbums(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const createAlbum = async (albumData) => {
    try {
      const newAlbum = await albumService.createAlbum(albumData);
      setAlbums(prev => [...prev, newAlbum]);
      return newAlbum;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateAlbum = async (id, albumData) => {
    try {
      const updatedAlbum = await albumService.updateAlbum(id, albumData);
      setAlbums(prev => prev.map(album => 
        album.albumID === id ? updatedAlbum : album
      ));
      return updatedAlbum;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAlbum = async (id) => {
    try {
      await albumService.deleteAlbum(id);
      setAlbums(prev => prev.filter(album => album.albumID !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleVisibility = async (id) => {
    try {
      await albumService.toggleVisibility(id);
      setAlbums(prev => prev.map(album => 
        album.albumID === id ? { ...album, isPublic: !album.isPublic } : album
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const searchAlbums = async (query) => {
    try {
      setLoading(true);
      const data = await albumService.searchAlbums(query);
      setAlbums(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    albums,
    loading,
    error,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    toggleVisibility,
    searchAlbums,
    refetchAlbums: fetchAlbums
  };
};