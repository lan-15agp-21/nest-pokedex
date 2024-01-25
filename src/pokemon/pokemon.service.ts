import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException,  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId,Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';


import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {
  pokemonModel: any;
  
  constructor(
    @InjectModel( Pokemon.name )
    private readonly PokemonModel: Model<Pokemon>,
  ){}
  
  async create(CreatePokemonDto: CreatePokemonDto) {
    CreatePokemonDto.name = CreatePokemonDto.name.toLocaleLowerCase();

    
  try {
    const pokemon = await this.PokemonModel.create( CreatePokemonDto );
    return pokemon;

  } catch ( error ) {
    if ( error.code === 11000 ) {
      throw new BadRequestException('Pokemon exists in db ${ JSON.stringify( error.KeyValue ) }');
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }

}  

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon

    if ( !isNaN( +term) ) {
      pokemon = await this.PokemonModel.findOne({ no: term });
    }
    
    
    
    
    // MongoID
    if  ( !pokemon && isValidObjectId( term ) ) {
      pokemon = await this.PokemonModel.findById( term );
    }

    // Name
    if ( !pokemon ) {
      pokemon = await this.PokemonModel.findOne({ name: term.toLocaleLowerCase().trim() })
    }


    if ( !pokemon ) 
    throw new NotFoundException(`Pokemon with id,name or no "${ term }" not found`);
    
    
    return pokemon;
  }

  async update( term: string, updatePokemonDto:  UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    await pokemon.updateOne( updatePokemonDto );

    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(id: string) {
    // const pokemon = await this.findOne( id );
    // await pokemon.deleteOne();
    // return{ id };
    // const result = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${ id }" not found`);
    
    return;
  }
}