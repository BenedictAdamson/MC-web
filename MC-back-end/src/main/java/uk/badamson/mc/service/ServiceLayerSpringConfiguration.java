package uk.badamson.mc.service;
/*
 * © Copyright Benedict Adamson 2018-20.
 *
 * This file is part of MC.
 *
 * MC is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MC is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with MC.  If not, see <https://www.gnu.org/licenses/>.
 */

import java.time.Clock;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

import uk.badamson.mc.repository.UserRepository;

/**
 * <p>
 * The Spring Boot configuration of the Mission Command game.
 * </p>
 */
@Configuration
@ComponentScan
public class ServiceLayerSpringConfiguration {

   @Bean
   public Clock clock() {
      return Clock.systemUTC();
   }

   @Bean
   public PasswordEncoder passwordEncoder() {
      return PasswordEncoderFactories.createDelegatingPasswordEncoder();
   }

   /**
    * <p>
    * Create the part of the service layer pertaining to scenarios of the
    * Mission Command game.
    * </p>
    *
    * @return the part of the service layer.
    */
   @Bean
   public ScenarioService scenarioService() {
      return new ScenarioServiceImpl();
   }

   /**
    * <p>
    * Create the part of the service layer pertaining to users of the Mission
    * Command game.
    * </p>
    *
    * @return the part of the service layer.
    */
   @Bean
   public UserService userService(
            @NonNull final PasswordEncoder passwordEncoder,
            @NonNull final UserRepository playerRepository,
            @NonNull @Value("${administrator.password:${random.uuid}}") final String administratorPassword) {
      return new UserServiceImpl(passwordEncoder, playerRepository,
               administratorPassword);
   }
}
