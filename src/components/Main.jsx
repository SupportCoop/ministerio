const App = () => {
  const {
    albums,
    loading,
    error,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    toggleVisibility,
    searchAlbums,
    refetchAlbums
  } = useAlbums();

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const handleCreateAlbum = async (albumData) => {
    try {
      await createAlbum(albumData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create album:', error);
    }
  };

  const handleUpdateAlbum = async (id, albumData) => {
    try {
      await updateAlbum(id, albumData);
      setShowEditModal(false);
      setEditingAlbum(null);
    } catch (error) {
      console.error('Failed to update album:', error);
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        await deleteAlbum(id);
      } catch (error) {
        console.error('Failed to delete album:', error);
      }
    }
  };

  const handleSearch = async (query) => {
    if (query.trim()) {
      await searchAlbums(query);
      setSearchActive(true);
    }
  };

  const handleClearSearch = () => {
    setSearchActive(false);
    refetchAlbums();
  };

  const handleViewDetails = (album) => {
    setSelectedAlbum(album);
    setShowAlbumModal(true);
  };

  const handleEditAlbum = (album) => {
    setEditingAlbum(album);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading albums...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <X className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error loading albums</p>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetchAlbums}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCreateAlbum={() => setShowCreateModal(true)} />
      
      <SearchBar 
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {searchActive && (
          <div className="mb-4 text-sm text-gray-600">
            Search results - <button 
              onClick={handleClearSearch}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Show all albums
            </button>
          </div>
        )}
        
        {albums.length === 0 ? (
          <div className="text-center py-12">
            <Image className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchActive ? 'No albums found' : 'No albums yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchActive ? 'Try a different search term' : 'Create your first album to get started'}
            </p>
            {!searchActive && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create Album
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => (
              <AlbumCard
                key={album.albumID}
                album={album}
                onEdit={handleEditAlbum}
                onDelete={handleDeleteAlbum}
                onToggleVisibility={toggleVisibility}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Modals */}
      <CreateAlbumModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAlbum}
      />
      
      <EditAlbumModal
        album={editingAlbum}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAlbum(null);
        }}
        onSubmit={handleUpdateAlbum}
      />
      
      <AlbumModal
        album={selectedAlbum}
        isOpen={showAlbumModal}
        onClose={() => {
          setShowAlbumModal(false);
          setSelectedAlbum(null);
        }}
      />
    </div>
  );
};

export default App;