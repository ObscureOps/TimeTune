package com.timetune.repository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timetune.domain.Song;
import org.springframework.stereotype.Repository;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
@Repository
public class InMemorySongRepository implements SongRepository {
 private record Entry(String id,String title,String artist,int releaseYear,String genre){}
 private final List<Song> songs; private final Map<String,Song> index;
 public InMemorySongRepository(ObjectMapper mapper){
  try(InputStream in=getClass().getResourceAsStream("/songs.json")){
   if(in==null)throw new IllegalStateException("songs.json missing");
   List<Entry> entries=mapper.readValue(in,new TypeReference<>(){});
   songs=entries.stream().map(e->new Song(UUID.nameUUIDFromBytes(e.id().getBytes(StandardCharsets.UTF_8)),e.title(),e.artist(),e.releaseYear(),e.genre())).toList();
   Map<String,Song> map=new HashMap<>();for(int i=0;i<entries.size();i++)map.put(entries.get(i).id(),songs.get(i));index=Map.copyOf(map);
  }catch(Exception e){throw new IllegalStateException("Catalogue failed to load",e);}
 }
 public List<Song> findAll(){return songs;} public Optional<Song> findByCatalogueId(String id){return Optional.ofNullable(index.get(id));}
}