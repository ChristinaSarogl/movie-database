type SearchProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

function Search({ searchTerm, setSearchTerm }: SearchProps) {
  return (
    <>
      <div className="search">
        <div>
          <img src="./search.svg" alt="Search"/>

          <input 
            type="text" 
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

export default Search;
