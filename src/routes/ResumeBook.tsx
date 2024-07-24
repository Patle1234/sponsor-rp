import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Box, Button, ChakraProvider, Flex, Icon, Image, IconButton, Text, HStack, Menu, MenuButton, Avatar, MenuList, MenuItem, useToast, useColorMode, useColorModeValue, FormControl, Select } from '@chakra-ui/react';
import ResumeGrid from './ResumeGrid';
import ResumeList from './ResumeList';
import { BsGrid, BsList, BsDownload } from "react-icons/bs";
import { BiSelectMultiple } from "react-icons/bi";
import { TiDocumentDelete } from "react-icons/ti";

import axios from 'axios';
import { saveAs } from 'file-saver';
import { Config } from "../config";
import { FaMoon, FaSun } from 'react-icons/fa';

interface Resume {
    id: string;
    name: string;
    imageUrl: string;
    major: string;
    graduationYear: string;
}

interface ResumeLink {
    url: string;
}

interface ResumeIDs {
    userId: string
    name: string
    major: string
    graduation: string
}


export function ResumeBook() {

    const toast = useToast();
    const { toggleColorMode } = useColorMode();
        
    // const resumes: Resume[] = [
        // { id: '1', name: 'Finn the Human', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Professional Furry', graduationYear: '2022'},
        // { id: '2', name: 'Jake the Dog', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Backend', graduationYear: '2023'},
        // { id: '3', name: 'Princess Bubblegum', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Frontend', graduationYear: '2024'},
        // { id: '4', name: 'Marceline the Vampire Queen', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Fullstack', graduationYear: '2025'},
        // { id: '5', name: 'BMO', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'DevOps', graduationYear: '2026'},
        // { id: '6', name: 'Princess Lumpy Space', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Designer', graduationYear: '2027'},
        // { id: '7', name: 'Ice King', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Manager', graduationYear: '2028'},
        // { id: '8', name: 'SpongeBob SquarePants', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'CEO', graduationYear: '2029'},
        // { id: '9', name: 'Patrick Star', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'CTO', graduationYear: '2030'},
        // { id: '10', name: 'Squidward Tentacles', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Sales', graduationYear: '2031'},
        // { id: '11', name: 'Mr. Krabs', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Marketing', graduationYear: '2032'},
        // { id: '12', name: 'Sandy Cheeks', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Pirate', graduationYear: '2033'},
        // { id: '13', name: 'Plankton', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Musician', graduationYear: '2034'},
        // { id: '14', name: 'Gary the Snail', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Rapper', graduationYear: '2035'},
        // { id: '15', name: 'Pearl Krabs', imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png', major: 'Singer', graduationYear: '2036'},
        // Add more resumes here
    // ];

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [filteredResumes, setFilteredResumes] = useState<Resume[]>([]);
    const [showList, setShowList] = useState(true);
    const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const [gradYear, setGradYear] = useState("");
    const [major, setMajor] = useState("");
    const viewColor = useColorModeValue("200","700")
    const selectViewColor = useColorModeValue("gray.300","gray.600")

    const showToast = (message: string) => {
        toast({
        title: message,
        status: "error",
        duration: 9000,
        isClosable: true,
        });
    }

    const filterResumes = useCallback(() => {
        let filtered = resumes;
        if (gradYear) {
            filtered = filtered.filter(resume => resume.graduationYear === gradYear);
        }
        if (major) {
            filtered = filtered.filter(resume => resume.major === major);
        }
        setFilteredResumes(filtered);
    }, [gradYear, major, resumes]); // Add empty array as second argument

    const handleGradYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setGradYear(value);
    };
    
    const handleMajorChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setMajor(value);
    };

  
    const toggleResume = (id: string) => {
        setSelectedResumes((prev) =>
            prev.includes(id) ? prev.filter((resumeId) => resumeId !== id) : [...prev, id]
        );
    };

    const selectAllResumes = () => {
        if (selectedResumes.length === filteredResumes.length) {
            setSelectedResumes([]);
        } else {
            setSelectedResumes(filteredResumes.map((resume) => resume.id));
        }
    };

    const downloadFileFromS3 = async (s3Url: string) => {
        try {
          const response = await axios.get(s3Url, {
            responseType: 'blob' // Ensure the response is a Blob
          });
      
          // Extract the filename from the Content-Disposition header or generate one
          const contentDisposition = response.headers['content-disposition'];
          let filename = 'downloaded-file';
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch.length === 2) {
              filename = filenameMatch[1];
            }
          }
      
          saveAs(response.data, filename);
        } catch (error) {
            showToast("Failed to download resume. Please try again later.");
        //   console.error('Error downloading the file:', error);
        }
    };

    const downloadResumes = () => {
        const jwt = localStorage.getItem('jwt');
        const selectedResumesIds = selectedResumes.join(',');
        axios.get(Config.API_BASE_URL + "/s3/download/user/"+ selectedResumesIds, {
            headers: {
                Authorization: jwt
            }
        })
        .then(function (response) {
            // console.log(response.data);
            const resData: ResumeLink[] | ResumeLink = response.data;
            if (Array.isArray(resData)) {
                resData.forEach(function (resumeURL) {
                    downloadFileFromS3(resumeURL.url);
                });
            } else {
                downloadFileFromS3(resData.url);
            }
        })
        .catch(function (error) {
            // console.log(error);
            showToast(`Error ${error}: Failed to download resumes. Please try again later.`);
        })
    }

    const getResumes = async () => {
        // localStorage.setItem("jwt", '');
        const jwt = localStorage.getItem("jwt");

        const requestBody = {
            filter: {
                hasResume: true
            },
            projection: [
                { userId: 1 },
                { name: 1 },
                { major: 1 },
                { graduation: 1 },
                { university: 1 },
                { dietaryRestrictions: 1 },
                { hasResume: 1 }
            ]
        };

        const headers = {
            Authorization: jwt
        };

        // axios.get(Config.API_BASE_URL + "/registration/filter", { headers, requestBody })
          
          
        const params = new URLSearchParams();
        params.append('filter', JSON.stringify(requestBody.filter));
        params.append('projection', JSON.stringify(requestBody.projection));
          
        axios.post(Config.API_BASE_URL + "/registration/filter", requestBody, {headers})
        .then(function (response) {
            // console.log(response.data)
            const fetchedResumes = response.data.map((item: ResumeIDs) => ({
                id: item.userId,
                name: item.name,
                imageUrl: 'https://icons.veryicon.com/png/o/miscellaneous/general-icon-library/resume-7.png',
                major: item.major,
                graduationYear: item.graduation
            }));
    
            // Use a Set to ensure unique resumes
            const uniqueResumes = new Set([...resumes, ...fetchedResumes]);
            setResumes(Array.from(uniqueResumes));
            setFilteredResumes(Array.from(uniqueResumes));
        })
        .catch(function (error) {
            // handle error
            // console.log(error);
            showToast(`Error ${error}: Failed to fetch resumes - please sign in again`);
        })
    }

    const signOut = () => {
        localStorage.removeItem("jwt");
        window.location.href = "/";
    }


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 550);
        };

        handleResize();

        if (resumes.length === 0) {
            getResumes();
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        filterResumes();
    }, [filterResumes, gradYear, major]);
    
    return (
        <ChakraProvider>
            <Flex h={16} alignItems={'center'} justifyContent={'space-between'} padding='10px'>
                {/* <IconButton
                    size={'lg'}
                    icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                    aria-label={'Open Menu'}
                    display={{ md: 'none' }}
                    onClick={isOpen ? onClose : onOpen}
                /> */}
                <HStack spacing={8} alignItems={'center'}>
                    <Flex align="center" mr={5} maxWidth={50}>
                    <Image
                        src="/2024_rp_logo.svg"
                        minHeight={50}
                        maxH="100%"
                        _hover={{ filter: "brightness(30%)", transition: "filter 0.2s ease-in-out", cursor: "pointer" }}
                        onClick={() => { window.location.href = "/" }}
                    />
                    </Flex>
                </HStack>
                <Text color='white'>Resume Book</Text>
                <Flex alignItems={'center'}>
                    <IconButton
                        isRound={true}
                        fontSize='26px'
                        mr={4}
                        aria-label="Toggle Light/Dark Mode"
                        icon={useColorModeValue(<FaMoon />, <FaSun />)}
                        onClick={toggleColorMode}
                        // variant="ghost"
                        bg='#0F1130'
                        color='#F7FAFC'
                        size="sm"
                    />
                    <Menu>
                    <MenuButton
                        as={Button}
                        rounded={'full'}
                        variant={'link'}
                        cursor={'pointer'}
                        minW={0}>
                        <Avatar
                        size={'sm'}
                        src={
                            'https://cdn-icons-png.freepik.com/512/8742/8742495.png'
                        }
                        />
                    </MenuButton>
                    <MenuList>
                        {/* <MenuItem onClick={printToken}>Print {userName} JWT</MenuItem> */}
                        {/* <MenuItem onClick={toggleColorMode}>Toggle Light/Dark Mode</MenuItem> */}
                        {/* <MenuItem onClick={getResumes}>Refresh Resumes</MenuItem> */}
                        {/* <MenuDivider /> */}
                        <MenuItem onClick={signOut}>Sign Out</MenuItem>
                    </MenuList>
                    </Menu>
                </Flex>
                </Flex>
            <Box bg={useColorModeValue("gray.200","gray.700")} p={4}>
                <Flex justify="space-between" align="center">
                    {/* <Flex align="center"></Flex> */}
                    
                    <Flex align='flex-start'>
                        <IconButton
                            color={useColorModeValue('black','white')}
                            aria-label='List View'
                            icon={<Icon as={BsList} boxSize={6} />}
                            onClick={() => setShowList(true)}
                            _hover={{ border:'1px solid black'}}
                            mr={2}
                            backgroundColor={showList ? 'gray.'+(parseInt(viewColor)-100) : 'gray.'+viewColor}
                            border={showList ? '1px solid black' : '1px solid gray.200'}
                        />
                        <IconButton
                            color={useColorModeValue('black','white')}
                            aria-label='Grid View'
                            icon={<Icon as={BsGrid} boxSize={6} />}
                            onClick={() => setShowList(false)}
                            _hover={{ border:'1px solid black'}}
                            backgroundColor={showList ? 'gray.'+viewColor : 'gray.'+(parseInt(viewColor)-100)}
                            border={showList ? '1px solid gray.200' : '1px solid black'}
                        />
                        <FormControl ml={5}>
                            <Select placeholder="Select Grad Year" onChange={handleGradYearChange}>
                            <option value="2022">2022</option>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            </Select>
                        </FormControl>

                        <FormControl ml={5}>
                            <Select placeholder="Select Major" onChange={handleMajorChange}>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            </Select>
                        </FormControl>
    
                    </Flex>
                    <Flex>

                        <Button onClick={selectAllResumes} mr={2} backgroundColor={selectedResumes.length === filteredResumes.length ? 'salmon' : 'blue.300'} color={useColorModeValue('white','black')} border='1px solid transparent' _hover={{ border:'1px solid black'}}>
                            {isMobile ? (
                                selectedResumes.length === filteredResumes.length ? <TiDocumentDelete/> : <BiSelectMultiple/>
                            ) : (
                                selectedResumes.length === filteredResumes.length ? 'Deselect All' : 'Select All'
                            )}
                        </Button>
                        <Button mr={2} onClick={downloadResumes} border='1px solid transparent' _hover={{ border:'1px solid black'}} backgroundColor={parseInt(viewColor) < 500 ? 'gray.'+(parseInt(viewColor)+300): 'gray.'+(parseInt(viewColor)-200)} color={useColorModeValue('white','black')} isDisabled={selectedResumes.length < 1}>
                            {isMobile ? <BsDownload/> : 'Download'}
                        </Button>
                        {/* <Button>Button 3</Button> */}
                    </Flex>
                </Flex>
            </Box>
            {
                showList ? <ResumeList resumes={filteredResumes} selectedResumes={selectedResumes} toggleResume={toggleResume} baseColor={viewColor} /> : <ResumeGrid resumes={filteredResumes} selectedResumes={selectedResumes} toggleResume={toggleResume} baseColor={viewColor} />
            }
        </ChakraProvider>
    );
}

export default ResumeBook;