import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    
    @InjectModel(Pokemon.name)
    private readonly pokemonModule: Model<Pokemon>,

    private readonly configService: ConfigService,
  
    ) {
      
      this.defaultLimit = configService.get<number>('defaultLimit');
      // console.log({ defaultLimit: configService.get<number>('defaultLimit') })
    }
  
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModule.create(createPokemonDto);
      return createPokemonDto;
      
      
    } catch (error) {
      if ( error.code === 11000 ) {
        throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
      }
      console.log(error);
      throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
    }
  }
    
  findAll( paginationDto: PaginationDto ) {

    

    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    return this.pokemonModule.find()
      .limit( limit )
      .skip( offset )
      .sort({
        no: 1
      })
      .select('-_V')
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;
    
    if ( isNaN(+term)){
      pokemon = await this.pokemonModule.findOne({no: term });
    }

    // Mondo ID
    if (!pokemon && isValidObjectId( term)){
      pokemon = await this.pokemonModule.findById( term );
    }
  
    // Name
    if (!pokemon){
      pokemon = await this.pokemonModule.findOne({ name: term.toLowerCase().trim() })
    }


    if ( !pokemon )
    throw new NotFoundException(`Pokemon with id, name or no "${ term }" not foud`);

    return pokemon;
  }
    
  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    
    const pokemon = await this.findOne( term );
    if ( updatePokemonDto.name )
    updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    
  try {
    await pokemon.updateOne( updatePokemonDto);
    return {...pokemon.toJSON(),...updatePokemonDto };

  } catch (error) {
    this.handleExceptions(error);
  }
}

async remove(id: string) { 
//  const pokemon = await this.findOne(id);
//  await pokemon.deleteOne();
//  return { id };
// const result = await this.PokemonModule.findByIdAndDelete(id);

const { deletedCount } = await this.pokemonModule.deleteOne({ _id: id});
if ( deletedCount === 0 )
throw new BadRequestException(`Pokemon with id "${ id })" not fount`);


return;
}
private handleExceptions( error: any ){
  if(error.code === 11000) {
    throw new BadRequestException(`Pokemon exists in db $ {
      JSON.stringify(error.keyValue)
    }`);
  }
  console.log(error);
  throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}    






