type SeedPlayer = {
  name: string
  nation: string
  nation_flag_url: string
  position: 'GK' | 'DEF' | 'MID' | 'ATT'
}

// Flag URLs from flagcdn.com (free, no auth required)
const flag = (code: string) => `https://flagcdn.com/w80/${code}.png`

function squad(
  nation: string,
  flagCode: string,
  players: Array<[string, 'GK' | 'DEF' | 'MID' | 'ATT']>
): SeedPlayer[] {
  return players.map(([name, position]) => ({
    name,
    nation,
    nation_flag_url: flag(flagCode),
    position,
  }))
}

export function seedPlayers(): SeedPlayer[] {
  return [
    // ===================== GROUP A =====================
    // USA (Hosts)
    ...squad('USA', 'us', [
      ['Matt Turner', 'GK'], ['Ethan Horvath', 'GK'], ['Zack Steffen', 'GK'],
      ['Sergino Dest', 'DEF'], ['Antonee Robinson', 'DEF'], ['Chris Richards', 'DEF'],
      ['Tim Ream', 'DEF'], ['Miles Robinson', 'DEF'], ['Mark McKenzie', 'DEF'],
      ['Cameron Carter-Vickers', 'DEF'],
      ['Weston McKennie', 'MID'], ['Tyler Adams', 'MID'], ['Yunus Musah', 'MID'],
      ['Gio Reyna', 'MID'], ['Brenden Aaronson', 'MID'], ['Johnny Cardoso', 'MID'],
      ['Malik Tillman', 'MID'],
      ['Christian Pulisic', 'ATT'], ['Timothy Weah', 'ATT'], ['Folarin Balogun', 'ATT'],
      ['Josh Sargent', 'ATT'], ['Ricardo Pepi', 'ATT'],
    ]),

    // Mexico (Hosts)
    ...squad('Mexico', 'mx', [
      ['Guillermo Ochoa', 'GK'], ['Luis Malagon', 'GK'], ['Carlos Acevedo', 'GK'],
      ['Jorge Sanchez', 'DEF'], ['Cesar Montes', 'DEF'], ['Johan Vasquez', 'DEF'],
      ['Jesus Gallardo', 'DEF'], ['Kevin Alvarez', 'DEF'], ['Gerardo Arteaga', 'DEF'],
      ['Edson Alvarez', 'MID'], ['Luis Chavez', 'MID'], ['Carlos Rodriguez', 'MID'],
      ['Orbelin Pineda', 'MID'], ['Diego Lainez', 'MID'], ['Erick Sanchez', 'MID'],
      ['Hirving Lozano', 'ATT'], ['Raul Jimenez', 'ATT'], ['Santiago Gimenez', 'ATT'],
      ['Alexis Vega', 'ATT'],
    ]),

    // Canada (Hosts)
    ...squad('Canada', 'ca', [
      ['Milan Borjan', 'GK'], ['Maxime Crepeau', 'GK'],
      ['Alphonso Davies', 'DEF'], ['Alistair Johnston', 'DEF'], ['Kamal Miller', 'DEF'],
      ['Steven Vitoria', 'DEF'], ['Richie Laryea', 'DEF'], ['Derek Cornelius', 'DEF'],
      ['Stephen Eustaquio', 'MID'], ['Ismael Kone', 'MID'], ['Mark-Anthony Kaye', 'MID'],
      ['Jonathan Osorio', 'MID'], ['Samuel Piette', 'MID'], ['Liam Millar', 'MID'],
      ['Jonathan David', 'ATT'], ['Cyle Larin', 'ATT'], ['Tajon Buchanan', 'ATT'],
      ['Ike Ugbo', 'ATT'],
    ]),

    // ===================== EUROPE =====================
    // England
    ...squad('England', 'gb-eng', [
      ['Jordan Pickford', 'GK'], ['Dean Henderson', 'GK'], ['Aaron Ramsdale', 'GK'],
      ['Trent Alexander-Arnold', 'DEF'], ['Kyle Walker', 'DEF'], ['John Stones', 'DEF'],
      ['Harry Maguire', 'DEF'], ['Marc Guehi', 'DEF'], ['Ben Chilwell', 'DEF'],
      ['Levi Colwill', 'DEF'],
      ['Declan Rice', 'MID'], ['Jude Bellingham', 'MID'], ['Phil Foden', 'MID'],
      ['Bukayo Saka', 'MID'], ['Kobbie Mainoo', 'MID'], ['Cole Palmer', 'MID'],
      ['Eberechi Eze', 'MID'],
      ['Harry Kane', 'ATT'], ['Ollie Watkins', 'ATT'], ['Anthony Gordon', 'ATT'],
      ['Ivan Toney', 'ATT'],
    ]),

    // France
    ...squad('France', 'fr', [
      ['Mike Maignan', 'GK'], ['Brice Samba', 'GK'],
      ['Jules Kounde', 'DEF'], ['Dayot Upamecano', 'DEF'], ['William Saliba', 'DEF'],
      ['Theo Hernandez', 'DEF'], ['Ibrahima Konate', 'DEF'], ['Ferland Mendy', 'DEF'],
      ['N\'Golo Kante', 'MID'], ['Aurelien Tchouameni', 'MID'], ['Eduardo Camavinga', 'MID'],
      ['Antoine Griezmann', 'MID'], ['Ousmane Dembele', 'MID'], ['Warren Zaire-Emery', 'MID'],
      ['Kylian Mbappe', 'ATT'], ['Marcus Thuram', 'ATT'], ['Randal Kolo Muani', 'ATT'],
      ['Olivier Giroud', 'ATT'],
    ]),

    // Germany
    ...squad('Germany', 'de', [
      ['Manuel Neuer', 'GK'], ['Marc-Andre ter Stegen', 'GK'],
      ['Antonio Rudiger', 'DEF'], ['Jonathan Tah', 'DEF'], ['Nico Schlotterbeck', 'DEF'],
      ['David Raum', 'DEF'], ['Joshua Kimmich', 'DEF'], ['Benjamin Henrichs', 'DEF'],
      ['Ilkay Gundogan', 'MID'], ['Toni Kroos', 'MID'], ['Jamal Musiala', 'MID'],
      ['Florian Wirtz', 'MID'], ['Robert Andrich', 'MID'], ['Leroy Sane', 'MID'],
      ['Kai Havertz', 'ATT'], ['Niclas Fullkrug', 'ATT'], ['Serge Gnabry', 'ATT'],
    ]),

    // Spain
    ...squad('Spain', 'es', [
      ['Unai Simon', 'GK'], ['David Raya', 'GK'],
      ['Dani Carvajal', 'DEF'], ['Aymeric Laporte', 'DEF'], ['Robin Le Normand', 'DEF'],
      ['Marc Cucurella', 'DEF'], ['Alejandro Grimaldo', 'DEF'], ['Pau Cubarsi', 'DEF'],
      ['Rodri', 'MID'], ['Pedri', 'MID'], ['Gavi', 'MID'],
      ['Dani Olmo', 'MID'], ['Fabian Ruiz', 'MID'], ['Nico Williams', 'MID'],
      ['Lamine Yamal', 'ATT'], ['Alvaro Morata', 'ATT'], ['Ferran Torres', 'ATT'],
      ['Mikel Oyarzabal', 'ATT'],
    ]),

    // Portugal
    ...squad('Portugal', 'pt', [
      ['Diogo Costa', 'GK'], ['Rui Patricio', 'GK'],
      ['Joao Cancelo', 'DEF'], ['Ruben Dias', 'DEF'], ['Pepe', 'DEF'],
      ['Nuno Mendes', 'DEF'], ['Diogo Dalot', 'DEF'], ['Goncalo Inacio', 'DEF'],
      ['Bruno Fernandes', 'MID'], ['Bernardo Silva', 'MID'], ['Vitinha', 'MID'],
      ['Joao Palhinha', 'MID'], ['Ruben Neves', 'MID'],
      ['Cristiano Ronaldo', 'ATT'], ['Rafael Leao', 'ATT'], ['Goncalo Ramos', 'ATT'],
      ['Diogo Jota', 'ATT'], ['Pedro Neto', 'ATT'],
    ]),

    // Netherlands
    ...squad('Netherlands', 'nl', [
      ['Bart Verbruggen', 'GK'], ['Justin Bijlow', 'GK'],
      ['Virgil van Dijk', 'DEF'], ['Nathan Ake', 'DEF'], ['Jurrien Timber', 'DEF'],
      ['Denzel Dumfries', 'DEF'], ['Stefan de Vrij', 'DEF'], ['Lutsharel Geertruida', 'DEF'],
      ['Frenkie de Jong', 'MID'], ['Ryan Gravenberch', 'MID'], ['Tijjani Reijnders', 'MID'],
      ['Xavi Simons', 'MID'], ['Teun Koopmeiners', 'MID'],
      ['Memphis Depay', 'ATT'], ['Cody Gakpo', 'ATT'], ['Donyell Malen', 'ATT'],
      ['Brian Brobbey', 'ATT'],
    ]),

    // Italy
    ...squad('Italy', 'it', [
      ['Gianluigi Donnarumma', 'GK'], ['Alex Meret', 'GK'],
      ['Giovanni Di Lorenzo', 'DEF'], ['Alessandro Bastoni', 'DEF'], ['Riccardo Calafiori', 'DEF'],
      ['Federico Dimarco', 'DEF'], ['Andrea Cambiaso', 'DEF'], ['Alessandro Buongiorno', 'DEF'],
      ['Nicolo Barella', 'MID'], ['Sandro Tonali', 'MID'], ['Lorenzo Pellegrini', 'MID'],
      ['Davide Frattesi', 'MID'], ['Bryan Cristante', 'MID'],
      ['Federico Chiesa', 'ATT'], ['Gianluca Scamacca', 'ATT'], ['Giacomo Raspadori', 'ATT'],
      ['Mateo Retegui', 'ATT'],
    ]),

    // Belgium
    ...squad('Belgium', 'be', [
      ['Koen Casteels', 'GK'], ['Thibaut Courtois', 'GK'],
      ['Timothy Castagne', 'DEF'], ['Jan Vertonghen', 'DEF'], ['Arthur Theate', 'DEF'],
      ['Wout Faes', 'DEF'], ['Zeno Debast', 'DEF'],
      ['Kevin De Bruyne', 'MID'], ['Youri Tielemans', 'MID'], ['Amadou Onana', 'MID'],
      ['Arne Engels', 'MID'], ['Orel Mangala', 'MID'],
      ['Romelu Lukaku', 'ATT'], ['Leandro Trossard', 'ATT'], ['Jeremy Doku', 'ATT'],
      ['Lois Openda', 'ATT'],
    ]),

    // Croatia
    ...squad('Croatia', 'hr', [
      ['Dominik Livakovic', 'GK'], ['Ivica Ivusic', 'GK'],
      ['Josko Gvardiol', 'DEF'], ['Duje Caleta-Car', 'DEF'], ['Borna Sosa', 'DEF'],
      ['Josip Sutalo', 'DEF'], ['Josip Stanisic', 'DEF'],
      ['Luka Modric', 'MID'], ['Mateo Kovacic', 'MID'], ['Marcelo Brozovic', 'MID'],
      ['Mario Pasalic', 'MID'], ['Lovro Majer', 'MID'],
      ['Andrej Kramaric', 'ATT'], ['Bruno Petkovic', 'ATT'], ['Ante Budimir', 'ATT'],
    ]),

    // Denmark
    ...squad('Denmark', 'dk', [
      ['Kasper Schmeichel', 'GK'], ['Frederik Ronnow', 'GK'],
      ['Simon Kjaer', 'DEF'], ['Andreas Christensen', 'DEF'], ['Joakim Maehle', 'DEF'],
      ['Victor Kristiansen', 'DEF'], ['Joachim Andersen', 'DEF'],
      ['Christian Eriksen', 'MID'], ['Pierre-Emile Hojbjerg', 'MID'], ['Morten Hjulmand', 'MID'],
      ['Mikkel Damsgaard', 'MID'],
      ['Rasmus Hojlund', 'ATT'], ['Jonas Wind', 'ATT'], ['Yussuf Poulsen', 'ATT'],
    ]),

    // Switzerland
    ...squad('Switzerland', 'ch', [
      ['Yann Sommer', 'GK'], ['Gregor Kobel', 'GK'],
      ['Manuel Akanji', 'DEF'], ['Fabian Schar', 'DEF'], ['Ricardo Rodriguez', 'DEF'],
      ['Nico Elvedi', 'DEF'], ['Silvan Widmer', 'DEF'],
      ['Granit Xhaka', 'MID'], ['Denis Zakaria', 'MID'], ['Remo Freuler', 'MID'],
      ['Xherdan Shaqiri', 'MID'],
      ['Breel Embolo', 'ATT'], ['Noah Okafor', 'ATT'], ['Zeki Amdouni', 'ATT'],
    ]),

    // ===================== SOUTH AMERICA =====================
    // Argentina
    ...squad('Argentina', 'ar', [
      ['Emiliano Martinez', 'GK'], ['Franco Armani', 'GK'],
      ['Nicolas Otamendi', 'DEF'], ['Cristian Romero', 'DEF'], ['Lisandro Martinez', 'DEF'],
      ['Nahuel Molina', 'DEF'], ['Nicolas Tagliafico', 'DEF'], ['Gonzalo Montiel', 'DEF'],
      ['Rodrigo De Paul', 'MID'], ['Enzo Fernandez', 'MID'], ['Alexis Mac Allister', 'MID'],
      ['Leandro Paredes', 'MID'], ['Giovani Lo Celso', 'MID'], ['Exequiel Palacios', 'MID'],
      ['Lionel Messi', 'ATT'], ['Julian Alvarez', 'ATT'], ['Lautaro Martinez', 'ATT'],
      ['Angel Di Maria', 'ATT'], ['Paulo Dybala', 'ATT'],
    ]),

    // Brazil
    ...squad('Brazil', 'br', [
      ['Alisson', 'GK'], ['Ederson', 'GK'],
      ['Marquinhos', 'DEF'], ['Eder Militao', 'DEF'], ['Gabriel Magalhaes', 'DEF'],
      ['Danilo', 'DEF'], ['Alex Telles', 'DEF'], ['Yan Couto', 'DEF'],
      ['Casemiro', 'MID'], ['Lucas Paqueta', 'MID'], ['Bruno Guimaraes', 'MID'],
      ['Andre', 'MID'], ['Joao Gomes', 'MID'],
      ['Vinicius Junior', 'ATT'], ['Rodrygo', 'ATT'], ['Endrick', 'ATT'],
      ['Raphinha', 'ATT'], ['Gabriel Martinelli', 'ATT'],
    ]),

    // Uruguay
    ...squad('Uruguay', 'uy', [
      ['Fernando Muslera', 'GK'], ['Sergio Rochet', 'GK'],
      ['Jose Gimenez', 'DEF'], ['Ronald Araujo', 'DEF'], ['Mathias Olivera', 'DEF'],
      ['Sebastian Coates', 'DEF'], ['Nahitan Nandez', 'DEF'],
      ['Federico Valverde', 'MID'], ['Rodrigo Bentancur', 'MID'], ['Manuel Ugarte', 'MID'],
      ['Giorgian De Arrascaeta', 'MID'], ['Nicolas De La Cruz', 'MID'],
      ['Darwin Nunez', 'ATT'], ['Luis Suarez', 'ATT'], ['Facundo Pellistri', 'ATT'],
    ]),

    // Colombia
    ...squad('Colombia', 'co', [
      ['David Ospina', 'GK'], ['Camilo Vargas', 'GK'],
      ['Davinson Sanchez', 'DEF'], ['Yerry Mina', 'DEF'], ['Johan Mojica', 'DEF'],
      ['Daniel Munoz', 'DEF'], ['Carlos Cuesta', 'DEF'],
      ['James Rodriguez', 'MID'], ['Jefferson Lerma', 'MID'], ['Richard Rios', 'MID'],
      ['Jhon Arias', 'MID'], ['Juan Cuadrado', 'MID'],
      ['Luis Diaz', 'ATT'], ['Rafael Santos Borre', 'ATT'], ['Jhon Cordoba', 'ATT'],
    ]),

    // Ecuador
    ...squad('Ecuador', 'ec', [
      ['Hernan Galindez', 'GK'], ['Alexander Dominguez', 'GK'],
      ['Piero Hincapie', 'DEF'], ['Felix Torres', 'DEF'], ['Pervis Estupinan', 'DEF'],
      ['Angelo Preciado', 'DEF'], ['Robert Arboleda', 'DEF'],
      ['Moises Caicedo', 'MID'], ['Carlos Gruezo', 'MID'], ['Alan Franco', 'MID'],
      ['Kendry Paez', 'MID'],
      ['Enner Valencia', 'ATT'], ['Michael Estrada', 'ATT'], ['Kevin Rodriguez', 'ATT'],
    ]),

    // ===================== AFRICA =====================
    // Morocco
    ...squad('Morocco', 'ma', [
      ['Yassine Bounou', 'GK'], ['Munir El Kajoui', 'GK'],
      ['Achraf Hakimi', 'DEF'], ['Noussair Mazraoui', 'DEF'], ['Nayef Aguerd', 'DEF'],
      ['Romain Saiss', 'DEF'], ['Jawad El Yamiq', 'DEF'],
      ['Sofyan Amrabat', 'MID'], ['Azzedine Ounahi', 'MID'], ['Bilal El Khannouss', 'MID'],
      ['Selim Amallah', 'MID'], ['Ilias Chair', 'MID'],
      ['Hakim Ziyech', 'ATT'], ['Youssef En-Nesyri', 'ATT'], ['Brahim Diaz', 'ATT'],
    ]),

    // Senegal
    ...squad('Senegal', 'sn', [
      ['Edouard Mendy', 'GK'], ['Seny Dieng', 'GK'],
      ['Kalidou Koulibaly', 'DEF'], ['Abdou Diallo', 'DEF'], ['Youssouf Sabaly', 'DEF'],
      ['Formose Mendy', 'DEF'], ['Pape Abou Cisse', 'DEF'],
      ['Idrissa Gueye', 'MID'], ['Nampalys Mendy', 'MID'], ['Pape Matar Sarr', 'MID'],
      ['Krepin Diatta', 'MID'],
      ['Sadio Mane', 'ATT'], ['Ismaila Sarr', 'ATT'], ['Nicolas Jackson', 'ATT'],
    ]),

    // Nigeria
    ...squad('Nigeria', 'ng', [
      ['Francis Uzoho', 'GK'], ['Maduka Okoye', 'GK'],
      ['William Troost-Ekong', 'DEF'], ['Calvin Bassey', 'DEF'], ['Ola Aina', 'DEF'],
      ['Semi Ajayi', 'DEF'], ['Bright Osayi-Samuel', 'DEF'],
      ['Wilfred Ndidi', 'MID'], ['Alex Iwobi', 'MID'], ['Joe Aribo', 'MID'],
      ['Raphael Onyedika', 'MID'],
      ['Victor Osimhen', 'ATT'], ['Ademola Lookman', 'ATT'], ['Samuel Chukwueze', 'ATT'],
    ]),

    // ===================== ASIA =====================
    // Japan
    ...squad('Japan', 'jp', [
      ['Shuichi Gonda', 'GK'], ['Daniel Schmidt', 'GK'],
      ['Takehiro Tomiyasu', 'DEF'], ['Ko Itakura', 'DEF'], ['Shogo Taniguchi', 'DEF'],
      ['Hiroki Ito', 'DEF'], ['Miki Yamane', 'DEF'],
      ['Wataru Endo', 'MID'], ['Takefusa Kubo', 'MID'], ['Kaoru Mitoma', 'MID'],
      ['Daichi Kamada', 'MID'], ['Hidemasa Morita', 'MID'],
      ['Kyogo Furuhashi', 'ATT'], ['Ayase Ueda', 'ATT'], ['Takuma Asano', 'ATT'],
    ]),

    // South Korea
    ...squad('South Korea', 'kr', [
      ['Kim Seung-gyu', 'GK'], ['Jo Hyeon-woo', 'GK'],
      ['Kim Min-jae', 'DEF'], ['Kim Young-gwon', 'DEF'], ['Kim Jin-su', 'DEF'],
      ['Cho Yu-min', 'DEF'], ['Park Ji-su', 'DEF'],
      ['Son Heung-min', 'MID'], ['Lee Jae-sung', 'MID'], ['Hwang In-beom', 'MID'],
      ['Jung Woo-young', 'MID'], ['Lee Kang-in', 'MID'],
      ['Hwang Hee-chan', 'ATT'], ['Cho Gue-sung', 'ATT'], ['Oh Hyeon-gyu', 'ATT'],
    ]),

    // Saudi Arabia
    ...squad('Saudi Arabia', 'sa', [
      ['Mohammed Al-Owais', 'GK'], ['Mohammed Al-Rubaie', 'GK'],
      ['Ali Al-Bulaihi', 'DEF'], ['Yasser Al-Shahrani', 'DEF'], ['Abdulelah Al-Amri', 'DEF'],
      ['Hassan Tambakti', 'DEF'], ['Saud Abdulhamid', 'DEF'],
      ['Salem Al-Dawsari', 'MID'], ['Mohamed Kanno', 'MID'], ['Abdulrahman Al-Aboud', 'MID'],
      ['Nawaf Al-Abed', 'MID'],
      ['Firas Al-Buraikan', 'ATT'], ['Abdullah Al-Hamdan', 'ATT'], ['Saleh Al-Shehri', 'ATT'],
    ]),

    // Australia
    ...squad('Australia', 'au', [
      ['Mat Ryan', 'GK'], ['Andrew Redmayne', 'GK'],
      ['Harry Souttar', 'DEF'], ['Kye Rowles', 'DEF'], ['Aziz Behich', 'DEF'],
      ['Nathaniel Atkinson', 'DEF'], ['Milos Degenek', 'DEF'],
      ['Aaron Mooy', 'MID'], ['Jackson Irvine', 'MID'], ['Riley McGree', 'MID'],
      ['Ajdin Hrustic', 'MID'], ['Keanu Baccus', 'MID'],
      ['Mathew Leckie', 'ATT'], ['Mitchell Duke', 'ATT'], ['Craig Goodwin', 'ATT'],
    ]),
  ]
}
