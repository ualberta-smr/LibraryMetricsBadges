create table bugs (
    libname STRING PRIMARY KEY,
    numberofbugs INTEGER,
    status STRING,
    FOREIGN KEY(libname) REFERENCES releasefreq(libname) ON DELETE CASCADE
);

create table releasefreq (
    libname STRING PRIMARY KEY,
    numreleases INTEGER,
    averagedays INTEGER,
    status STRING,
    FOREIGN KEY(libname) REFERENCES bugs(libname) ON DELETE CASCADE
);
