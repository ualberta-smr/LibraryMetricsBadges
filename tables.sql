create table bugs (
    libname STRING PRIMARY KEY,
    numberofbugs INTEGER,
    status STRING,
    FOREIGN KEY(libname) REFERENCES releasefreq(libnamme) ON DELETE CASCADE
);

create table releasefreq (
    libname STRING PRIMARY KEY,
    numreleases INTEGER,
    averagedays INTEGER,
    status STRING,
    FOREIGN KEY(libname) REFERENCES releasefreq(libnamme) ON DELETE CASCADE
);
