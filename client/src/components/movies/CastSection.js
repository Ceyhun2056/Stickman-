import React from 'react';

const CastSection = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
      <div className="flex overflow-x-auto pb-4 scrollbar-hide gap-4">
        {cast.slice(0, 10).map((person) => (
          <div key={person.id} className="flex-shrink-0 w-32 text-center">
            <div className="w-32 h-32 mb-3 overflow-hidden rounded-full bg-dark-800">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Photo</span>
                </div>
              )}
            </div>
            <h3 className="text-white font-medium text-sm mb-1">{person.name}</h3>
            <p className="text-gray-400 text-xs">{person.character}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CastSection;
