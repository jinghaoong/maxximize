import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { Organisation } from '../organisations/entities/organisation.entity';
import { ContactsModule } from '../contacts/contacts.module';
import { OrganisationsModule } from '../organisations/organisations.module';
import { UsernameAlreadyExistsException } from './exceptions/UsernameAlreadyExistsException';
import { UnknownPersistenceException } from './exceptions/UnknownPersistenceException';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Contact, Organisation]),
    ContactsModule,
    forwardRef(() => OrganisationsModule),
    MailModule,
    UsernameAlreadyExistsException,
    UnknownPersistenceException,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
