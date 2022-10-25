import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SearchShows from "./SearchShows";
import noImage from "../img/download.jpeg";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  makeStyles,
  Button,
} from "@material-ui/core";

import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import "../App.css";

const useStyles = makeStyles({
  card: {
    maxWidth: 250,
    height: "auto",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 5,
    border: "1px solid #1e8678",
    boxShadow: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);",
  },
  titleHead: {
    borderBottom: "1px solid #1e8678",
    fontWeight: "bold",
  },
  grid: {
    flexGrow: 1,
    flexDirection: "row",
  },
  media: {
    height: "100%",
    width: "100%",
  },
  button: {
    color: "#1e8678",
    fontWeight: "bold",
    fontSize: 12,
  },
});
const ShowList = (props) => {
  const regex = /(<([^>]+)>)/gi;
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState(undefined);
  const [showsData, setShowsData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [hidPrev, setHidPrev] = useState(false);
  const [hidNext, setHidNext] = useState(false);
  const [showFail, setShowFail] = useState(false);

  let pagenum = parseInt(useParams().page);
  // console.log(useParams().page);

  // console.log(`current pagenum is=${pagenum}`);

  let card = null;

  const navigate = useNavigate();

  useEffect(() => {
    console.log("on load useeffect");
    async function fetchData() {
      try {
        const { data } = await axios.get(`http://api.tvmaze.com/shows`);
        setShowsData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    console.log("search useEffect fired");

    async function fetchData() {
      try {
        console.log(`in fetch searchTerm: ${searchTerm}`);
        const { data } = await axios.get(
          "http://api.tvmaze.com/search/shows?q=" + searchTerm
        );
        setSearchData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    if (searchTerm) {
      console.log("searchTerm is set");
      fetchData();
    }
  }, [searchTerm]);

  // this function to achieve when users click next or previous,
  // the page change is because of this useEffect
  useEffect(() => {
    console.log("page fetch");
    setHidNext(false);
    setShowFail(false);
    async function fetch() {
      try {
        const { data } = await axios.get(
          `https://api.tvmaze.com/shows?page=${page}`
        );

        if (page === 0) setHidPrev(true);
        else setHidPrev(false);

        try {
          const { nextData } = await axios.get(
            `https://api.tvmaze.com/shows?page=${page + 1}`
          );
        } catch (e) {
          console.log(e);
          if (e.response.status === 404) {
            console.log("in 404 error");
            setHidNext(true);
          }
        }

        setShowsData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setShowFail(true);
      }
    }

    fetch();
  }, [page]);

  // write this useEffect to achieve when we input the page manually,
  // the page jump to the correct page by render this useEffect
  useEffect(() => {
    console.log("pagenum fetch");
    // console.log(pagenum);
    setPage(pagenum);
    setHidNext(false);
    setShowFail(false);

    async function fetch() {
      try {
        const { data } = await axios.get(
          `https://api.tvmaze.com/shows?page=${pagenum}`
        );
        // console.log("Are you in?");
        // console.log(pagenum);
        if (pagenum <= 0) {
          setHidPrev(true);
        } else {
          setHidPrev(false);
        }

        try {
          const { nextData } = await axios.get(
            `https://api.tvmaze.com/shows?page=${pagenum}`
          );
        } catch (e) {
          console.log(e);
          if (e.response.status === 404) {
            setHidNext(true);
          }
        }

        setShowsData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setShowFail(true);
      }
    }
    fetch();
  }, [pagenum]);

  const searchValue = async (value) => {
    setSearchTerm(value);
  };
  const buildCard = (show) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={show.id}>
        <Card className={classes.card} variant="outlined">
          <CardActionArea>
            <Link to={`/shows/${show.id}`}>
              <CardMedia
                className={classes.media}
                component="img"
                image={
                  show.image && show.image.original
                    ? show.image.original
                    : noImage
                }
                title="show image"
              />

              <CardContent>
                <Typography
                  className={classes.titleHead}
                  gutterBottom
                  variant="h6"
                  component="h3"
                >
                  {show.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {show.summary
                    ? show.summary.replace(regex, "").substring(0, 139) + "..."
                    : "No Summary"}
                  <span>More Info</span>
                </Typography>
              </CardContent>
            </Link>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  async function prevPage() {
    if (page > 0) {
      setPage(page - 1);
      console.log(page);
      console.log("function prevPage in");
      let urlPath = `/shows/page/${page - 1}`;
      navigate(urlPath);
    }
  }

  async function nextPage() {
    setPage(page + 1);
    console.log(page);
    console.log("function nextPage in");
    let urlPath = `/shows/page/${page + 1}`;
    navigate(urlPath);
  }

  if (showFail) {
    return (
      <div>
        <h1>Oh! you input the pages is not found! Please try again!</h1>
      </div>
    );
  }

  if (searchTerm) {
    card =
      searchData &&
      searchData.map((shows) => {
        let { show } = shows;
        return buildCard(show);
      });
  } else {
    card =
      showsData &&
      showsData.map((show) => {
        return buildCard(show);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else {
    return (
      <div>
        {hidPrev ? <p></p> : <Button onClick={prevPage}>Previous</Button>}
        {hidNext ? <p></p> : <Button onClick={nextPage}>Next</Button>}

        <SearchShows searchValue={searchValue} />
        <br />
        <br />
        <Grid container className={classes.grid} spacing={5}>
          {card}
        </Grid>
      </div>
    );
  }
};

export default ShowList;
